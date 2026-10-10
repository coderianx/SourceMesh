package auth

import (
	"SourceMeshBackend/internal/models"
	"SourceMeshBackend/internal/store"
	"encoding/json"
	"net/http"

	"github.com/coderianx/goflow"
	"golang.org/x/crypto/bcrypt"
)

func Register(
	w http.ResponseWriter,
	r *http.Request,
) {
	ctx := goflow.Context(w, r)

	var req models.RegisterReq

	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "invalid request",
		})

		return
	}

	if req.Username == "" {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "username is required",
		})
		return
	}

	if len(req.Password) == 0 {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "password is required",
		})
		return
	}

	if len(req.Password) < 6 {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "password is too short",
		})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(req.Password),
		12,
	)

	if err != nil {
		ctx.SendJSON(500, goflow.H{
			"error": "Bcrypt hash error",
		})
		return
	}

	// insert database
	_, err = store.DB.Exec(
		r.Context(),
		`
		INSERT INTO users (
			username, password
		)
		VALUES ($1,$2);
		`,
		req.Username,
		string(hashedPassword),
	)

	if err != nil {
		if store.IsUnique(err) {
			ctx.SendJSON(http.StatusConflict, goflow.H{
				"error": "username already exists",
			})
			return
		}

		ctx.SendJSON(http.StatusInternalServerError, goflow.H{
			"error": "Database error",
		})
		return
	}

	ctx.SendJSON(201, goflow.H{
		"message": "user created",
	})
}
