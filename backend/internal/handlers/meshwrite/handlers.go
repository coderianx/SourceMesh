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

	var (
		meshwriteID int64
		username    string
		title       string
		content     string
		createdAt   time.Time
	)

	err = store.DB.QueryRow(
		r.Context(),
		`
		SELECT id, username, title, content, created_at
		FROM meshwrites
		WHERE id = $1;
		`,
		id,
	).Scan(
		&meshwriteID,
		&username,
		&title,
		&content,
		&createdAt,
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
