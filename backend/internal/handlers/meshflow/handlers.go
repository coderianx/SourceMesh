package meshflow

import (
	"SourceMeshBackend/internal/middlewares"
	"SourceMeshBackend/internal/models"
	"SourceMeshBackend/internal/store"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/coderianx/goflow"
	"github.com/go-chi/chi/v5"
)

func CreateMeshFlow(
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

	var req models.CreateMeshFlowReq

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "invalid request",
		})
		return
	}

	content := strings.TrimSpace(req.Content)

	if content == "" {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "content is required",
		})
		return
	}

	if len([]rune(content)) > 1000 {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "content is too long",
		})

		return
	}

	var (
		id        int64
		createdAt time.Time
	)

	err := store.DB.QueryRow(
		r.Context(),
		`
		INSERT INTO meshflows (user_id, username, content)
		VALUES ($1, $2, $3)
		RETURNING id, created_at;
		`,
		claims.UserID,
		claims.Username,
		content,
	).Scan(
		&id,
		&createdAt,
	)

	if err != nil {
		ctx.SendJSON(http.StatusInternalServerError, goflow.H{
			"error": "database error",
		})
		return
	}

	ctx.SendJSON(http.StatusCreated, goflow.H{
		"message":    "meshflow created",
		"id":         id,
		"content":    content,
		"created_at": createdAt,
	})
}

func DeleteMeshflow(
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
			"error": "invalid meshflow id",
		})
		return
	}

	result, err := store.DB.Exec(
		r.Context(),
		`
		DELETE FROM meshflows
		WHERE id = $1 AND user_id = $2;
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
			"error": "meshflow not found",
		})
		return
	}

	ctx.SendJSON(http.StatusOK, goflow.H{
		"message": "meshflow deleted",
		"id":      id,
	})
}

func CreateComment(
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

	meshflowID, err := strconv.ParseInt(
		chi.URLParam(r, "id"),
		10,
		64,
	)

	if err != nil || meshflowID <= 0 {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "invalid meshflow id",
		})
		return
	}

	var req models.CreateCommentReq

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "invalid request",
		})
		return
	}

	content := strings.TrimSpace(req.Content)

	if content == "" {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "content is required",
		})
		return
	}

	if len([]rune(content)) > 1000 {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "content is too long",
		})

		return
	}

	var exists bool

	err = store.DB.QueryRow(
		r.Context(),
		`
		SELECT EXISTS (
			SELECT 1
			FROM meshflows
			WHERE id = $1
		);
		`,
		meshflowID,
	).Scan(
		&exists,
	)

	if err != nil {
		ctx.SendJSON(http.StatusInternalServerError, goflow.H{
			"error": "database error",
		})
		return
	}

	if !exists {
		ctx.SendJSON(http.StatusNotFound, goflow.H{
			"error": "meshflow not found",
		})
		return
	}

	var (
		id        int64
		createdAt time.Time
	)

	err = store.DB.QueryRow(
		r.Context(),
		`
		INSERT INTO comments (
			meshflow_id, user_id, username, content
		)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at;
		`,
		meshflowID,
		claims.UserID,
		claims.Username,
		content,
	).Scan(
		&id,
		&createdAt,
	)

	if err != nil {
		ctx.SendJSON(http.StatusInternalServerError, goflow.H{
			"error": "database error",
		})
		return
	}

	ctx.SendJSON(http.StatusCreated, goflow.H{
		"message":     "comment created",
		"id":          id,
		"meshflow_id": meshflowID,
		"username":    claims.Username,
		"content":     content,
		"created_at":  createdAt,
	})
}

func ListComments(
	w http.ResponseWriter,
	r *http.Request,
) {
	ctx := goflow.Context(w, r)

	if _, ok := middlewares.GetClaims(r); !ok {
		ctx.SendJSON(http.StatusUnauthorized, goflow.H{
			"error": "unauthorized",
		})
		return
	}

	meshflowID, err := strconv.ParseInt(
		chi.URLParam(r, "id"),
		10,
		64,
	)

	if err != nil || meshflowID <= 0 {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "invalid meshflow id",
		})
		return
	}

	var exists bool

	err = store.DB.QueryRow(
		r.Context(),
		`
		SELECT EXISTS (
			SELECT 1
			FROM meshflows
			WHERE id = $1
		);
		`,
		meshflowID,
	).Scan(
		&exists,
	)

	if err != nil {
		ctx.SendJSON(http.StatusInternalServerError, goflow.H{
			"error": "database error",
		})
		return
	}

	if !exists {
		ctx.SendJSON(http.StatusNotFound, goflow.H{
			"error": "meshflow not found",
		})
		return
	}

	rows, err := store.DB.Query(
		r.Context(),
		`
		SELECT id, user_id, username, content, created_at
		FROM comments
		WHERE meshflow_id = $1
		ORDER BY created_at ASC;
		`,
		meshflowID,
	)

	if err != nil {
		ctx.SendJSON(http.StatusInternalServerError, goflow.H{
			"error": "database error",
		})
		return
	}

	defer rows.Close()

	comments := []goflow.H{}

	for rows.Next() {
		var (
			id        int64
			userID    int64
			username  string
			content   string
			createdAt time.Time
		)

		err := rows.Scan(
			&id,
			&userID,
			&username,
			&content,
			&createdAt,
		)

		if err != nil {
			ctx.SendJSON(http.StatusInternalServerError, goflow.H{
				"error": "database error",
			})
			return
		}

		comments = append(comments, goflow.H{
			"id":         id,
			"user_id":    userID,
			"username":   username,
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
		"meshflow_id": meshflowID,
		"comments":    comments,
	})
}
