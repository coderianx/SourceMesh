package public

import (
	"SourceMeshBackend/internal/middlewares"
	"SourceMeshBackend/internal/store"
	"errors"
	"net/http"
	"time"

	"github.com/coderianx/goflow"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
)

func GetProfileByUsername(
	w http.ResponseWriter,
	r *http.Request,
) {
	ctx := goflow.Context(w, r)

	usernameParam := chi.URLParam(r, "username")

	if usernameParam == "" {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "username is required",
		})
		return
	}

	var (
		userID   int64
		username string
	)

	err := store.DB.QueryRow(
		r.Context(),
		`
		SELECT id, username
		FROM users
		WHERE username = $1;
		`,
		usernameParam,
	).Scan(
		&userID,
		&username,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			ctx.SendJSON(http.StatusNotFound, goflow.H{
				"error": "user not found",
			})
			return
		}

		ctx.SendJSON(http.StatusInternalServerError, goflow.H{
			"error": "database error",
		})
		return
	}

	viewerID := int64(0)

	if claims, ok := middlewares.GetClaims(r); ok {
		viewerID = claims.UserID
	}

	rows, err := store.DB.Query(
		r.Context(),
		`
		SELECT
			m.id,
			m.content,
			m.created_at,
			COUNT(l.id) AS likes,
			EXISTS (
				SELECT 1
				FROM likes ul
				WHERE ul.meshflow_id = m.id
				  AND ul.user_id = $2
			) AS liked
		FROM meshflows m
		LEFT JOIN likes l ON l.meshflow_id = m.id
		WHERE m.user_id = $1
		GROUP BY m.id
		ORDER BY m.created_at DESC;
		`,
		userID,
		viewerID,
	)

	if err != nil {
		ctx.SendJSON(http.StatusInternalServerError, goflow.H{
			"error": "database error",
		})
		return
	}

	defer rows.Close()

	meshflows := []goflow.H{}

	for rows.Next() {
		var (
			id        int64
			content   string
			createdAt time.Time
			likes     int64
			liked     bool
		)

		err := rows.Scan(
			&id,
			&content,
			&createdAt,
			&likes,
			&liked,
		)

		if err != nil {
			ctx.SendJSON(http.StatusInternalServerError, goflow.H{
				"error": "database error",
			})
			return
		}

		meshflows = append(meshflows, goflow.H{
			"id":         id,
			"content":    content,
			"created_at": createdAt,
			"likes":      likes,
			"liked":      liked,
		})
	}

	if err := rows.Err(); err != nil {
		ctx.SendJSON(http.StatusInternalServerError, goflow.H{
			"error": "database error",
		})
		return
	}

	ctx.SendJSON(http.StatusOK, goflow.H{
		"id":       userID,
		"username": username,
		"mesflows": meshflows,
	})
}
