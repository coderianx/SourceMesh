package meshwrite

import (
	"SourceMeshBackend/internal/middlewares"
	"SourceMeshBackend/internal/models"
	"SourceMeshBackend/internal/store"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/coderianx/goflow"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/redis/go-redis/v9"
)

func NewMeshWrite(
	w http.ResponseWriter,
	r *http.Request,
) {
	ctx := goflow.Context(w, r)

	claims, ok := middlewares.GetClaims(r)

	if !ok {
		ctx.SendJSON(http.StatusUnauthorized, goflow.H{
			"error": "unauthorized",
		})

		return
	}

	var req models.NewMeshWrite

	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "invalid request",
		})
		return
	}

	if req.Title == "" {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "title is required",
		})

		return
	}

	if len(req.Title) > 200 {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "title is too long",
		})

		return
	}

	if req.Content == "" {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "content is required",
		})

		return
	}

	// Save to database
	_, err = store.DB.Exec(
		r.Context(),
		`
		INSERT INTO meshwrites (user_id, username, title, content)
		VALUES ($1,$2,$3,$4)
		`,
		claims.UserID,
		claims.Username,
		req.Title,
		req.Content,
	)

	if err != nil {
		ctx.SendJSON(http.StatusInternalServerError, goflow.H{
			"error": "database error",
		})

		return
	}

	ctx.SendJSON(201, goflow.H{
		"message": "meshwrite created",
	})

}

func DeleteMeshWrite(
	w http.ResponseWriter,
	r *http.Request,
) {
	ctx := goflow.Context(w, r)

	claims, ok := middlewares.GetClaims(r)

	if !ok {
		ctx.SendJSON(http.StatusUnauthorized, goflow.H{
			"error": "unauthorized",
		})

		return
	}

	id, err := strconv.ParseInt(
		chi.URLParam(r, "id"),
		10,
		64,
	)

	if err != nil || id <= 0 {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "invalid meshwrite id",
		})

		return
	}

	result, err := store.DB.Exec(
		r.Context(),
		`
		DELETE FROM meshwrites
		WHERE id = $1 AND user_id = $2
		`,
		id,
		claims.UserID,
	)

	if err != nil {
		ctx.SendJSON(http.StatusInternalServerError, goflow.H{
			"error": "database error",
		})

		return
	}

	if result.RowsAffected() == 0 {
		ctx.SendJSON(http.StatusNotFound, goflow.H{
			"error": "meshwrite not found",
		})

		return
	}

	ctx.SendJSON(200, goflow.H{
		"message": "meshwrite deleted",
	})

}

// ListUserMeshWrites returns the meshwrites of a user, newest first.
func ListUserMeshWrites(
	ctx context.Context,
	userID int64,
) ([]goflow.H, error) {
	rows, err := store.DB.Query(
		ctx,
		`
		SELECT id, title, content, created_at
		FROM meshwrites
		WHERE user_id = $1
		ORDER BY created_at DESC;
		`,
		userID,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	meshwrites := []goflow.H{}

	for rows.Next() {
		var (
			id        int64
			title     string
			content   string
			createdAt time.Time
		)

		if err := rows.Scan(
			&id,
			&title,
			&content,
			&createdAt,
		); err != nil {
			return nil, err
		}

		meshwrites = append(meshwrites, goflow.H{
			"id":         id,
			"title":      title,
			"content":    content,
			"created_at": createdAt,
		})
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return meshwrites, nil
}

func GetMeshWrite(
	w http.ResponseWriter,
	r *http.Request,
) {
	ctx := goflow.Context(w, r)

	id, err := strconv.ParseInt(
		chi.URLParam(r, "id"),
		10,
		64,
	)

	if err != nil || id <= 0 {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "invalid meshwrite id",
		})

		return
	}

	// Optional auth: when a viewer token is present, report whether the
	// viewer has saved this meshwrite.
	viewerID := int64(0)

	if claims, ok := middlewares.GetClaims(r); ok {
		viewerID = claims.UserID
	}

	var (
		meshwriteID int64
		username    string
		title       string
		content     string
		createdAt   time.Time
		saved       bool
	)

	err = store.DB.QueryRow(
		r.Context(),
		`
		SELECT
			id,
			username,
			title,
			content,
			created_at,
			EXISTS (
				SELECT 1
				FROM meshwrites_saves ms
				WHERE ms.meshwrite_id = meshwrites.id
				  AND ms.user_id = $2
			) AS saved
		FROM meshwrites
		WHERE id = $1;
		`,
		id,
		viewerID,
	).Scan(
		&meshwriteID,
		&username,
		&title,
		&content,
		&createdAt,
		&saved,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			ctx.SendJSON(http.StatusNotFound, goflow.H{
				"error": "meshwrite not found",
			})

			return
		}

		ctx.SendJSON(http.StatusInternalServerError, goflow.H{
			"error": "database error",
		})

		return
	}

	ctx.SendJSON(http.StatusOK, goflow.H{
		"id":         meshwriteID,
		"username":   username,
		"title":      title,
		"content":    content,
		"created_at": createdAt,
		"saved":      saved,
	})
}

func LastMeshWrites(
	w http.ResponseWriter,
	r *http.Request,
) {
	ctx := goflow.Context(w, r)

	cached, err := store.CacheRedisClient.Get(
		r.Context(),
		store.MeshWriteCacheKey,
	).Result()

	if err != nil {
		if errors.Is(err, redis.Nil) {
			ctx.SendJSON(http.StatusOK, goflow.H{
				"meshwrites": []store.MeshWriteCacheItem{},
			})

			return
		}

		ctx.SendJSON(http.StatusInternalServerError, goflow.H{
			"error": "redis error",
		})

		return
	}

	// The cache already holds a response-ready JSON array; pass it through
	// untouched instead of unmarshalling and re-encoding it per request.
	ctx.SendJSON(http.StatusOK, goflow.H{
		"meshwrites": json.RawMessage(cached),
	})
}

func SaveMeshWrite(
	w http.ResponseWriter,
	r *http.Request,
) {
	ctx := goflow.Context(w, r)

	claims, ok := middlewares.GetClaims(r)

	if !ok {
		ctx.SendJSON(http.StatusUnauthorized, goflow.H{
			"error": "unauthorized",
		})

		return
	}

	meshwriteID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

	if err != nil {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "invalid meshwrite id",
		})

		return
	}

	var exists bool

	err = store.DB.QueryRow(
		r.Context(),
		`
		SELECT EXISTS (
			SELECT 1
			FROM meshwrites
			WHERE id = $1
		);
		`,
		meshwriteID,
	).Scan(
		&exists,
	)

	if err != nil {
		ctx.SendJSON(500, goflow.H{
			"error": "database error",
		})
		return
	}

	if !exists {
		ctx.SendJSON(404, goflow.H{
			"error": "meshwrite not found",
		})
		return
	}

	_, err = store.DB.Exec(
		r.Context(),
		`
		INSERT INTO meshwrites_saves (
			user_id, meshwrite_id
		)
		VALUES ($1,$2);
		`,
		claims.UserID,
		meshwriteID,
	)

	if err != nil {
		if store.IsUnique(err) {
			ctx.SendJSON(http.StatusConflict, goflow.H{
				"error": "meshwrite already saved",
				"saved": true,
			})

			return
		}

		ctx.SendJSON(500, goflow.H{
			"error": "database error",
		})
		return
	}

	ctx.SendJSON(201, goflow.H{
		"message": "meshwrite saved",
		"saved":   true,
	})

}

// UnsaveMeshWrite removes the save of the user for the given meshwrite.
func UnsaveMeshWrite(
	w http.ResponseWriter,
	r *http.Request,
) {
	ctx := goflow.Context(w, r)

	claims, ok := middlewares.GetClaims(r)

	if !ok {
		ctx.SendJSON(http.StatusUnauthorized, goflow.H{
			"error": "unauthorized",
		})

		return
	}

	id, err := strconv.ParseInt(
		chi.URLParam(r, "id"),
		10,
		64,
	)

	if err != nil || id <= 0 {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "invalid meshwrite id",
		})

		return
	}

	result, err := store.DB.Exec(
		r.Context(),
		`
		DELETE FROM meshwrites_saves
		WHERE user_id = $1 AND meshwrite_id = $2
		`,
		claims.UserID,
		id,
	)

	if err != nil {
		ctx.SendJSON(http.StatusInternalServerError, goflow.H{
			"error": "database error",
		})

		return
	}

	if result.RowsAffected() == 0 {
		ctx.SendJSON(http.StatusNotFound, goflow.H{
			"error": "save not found",
		})

		return
	}

	ctx.SendJSON(http.StatusOK, goflow.H{
		"message": "meshwrite unsaved",
		"saved":   false,
	})

}

// ListSavedMeshWrites returns the meshwrites saved by the user,
// most recently saved first.
func ListSavedMeshWrites(
	w http.ResponseWriter,
	r *http.Request,
) {
	ctx := goflow.Context(w, r)

	claims, ok := middlewares.GetClaims(r)

	if !ok {
		ctx.SendJSON(http.StatusUnauthorized, goflow.H{
			"error": "unauthorized",
		})

		return
	}

	rows, err := store.DB.Query(
		r.Context(),
		`
		SELECT m.id, m.username, m.title, m.content, m.created_at
		FROM meshwrites_saves s
		JOIN meshwrites m ON m.id = s.meshwrite_id
		WHERE s.user_id = $1
		ORDER BY s.id DESC;
		`,
		claims.UserID,
	)

	if err != nil {
		ctx.SendJSON(http.StatusInternalServerError, goflow.H{
			"error": "database error",
		})

		return
	}

	defer rows.Close()

	saves := []goflow.H{}

	for rows.Next() {
		var (
			id        int64
			username  string
			title     string
			content   string
			createdAt time.Time
		)

		if err := rows.Scan(
			&id,
			&username,
			&title,
			&content,
			&createdAt,
		); err != nil {
			ctx.SendJSON(http.StatusInternalServerError, goflow.H{
				"error": "database error",
			})

			return
		}

		saves = append(saves, goflow.H{
			"id":         id,
			"username":   username,
			"title":      title,
			"content":    content,
			"created_at": createdAt,
		})
	}

	if err := rows.Err(); err != nil {
		ctx.SendJSON(http.StatusInternalServerError, goflow.H{
			"error": "database error",
		})

		return
	}

	ctx.SendJSON(http.StatusOK, goflow.H{
		"meshwrites": saves,
	})

}
