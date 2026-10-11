package auth

import (
	"SourceMeshBackend/internal/middlewares"
	"SourceMeshBackend/internal/models"
	"SourceMeshBackend/internal/store"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/coderianx/goflow"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
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

	if len(req.Username) > 20 {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "username is too long",
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
			username, name, password
		)
		VALUES ($1,$1,$2);
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

func Login(
	w http.ResponseWriter,
	r *http.Request,
) {
	ctx := goflow.Context(w, r)

	secretKey := os.Getenv("JWT_SECRET")

	if secretKey == "" {
		ctx.SendJSON(500, goflow.H{
			"error": "secret error",
		})

		fmt.Println("[WARNING] JWT_SECRET is empty")

		return
	}

	var req models.LoginReq

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

	if len(req.Username) > 20 {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "username is too long",
		})

		return
	}

	if len(req.Password) < 6 {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "password is too short",
		})

		return
	}

	var (
		userID     int64
		passwordDB string
	)

	err = store.DB.QueryRow(
		r.Context(),
		`
		SELECT id, password
		FROM users
		WHERE username = $1;
		`,
		req.Username,
	).Scan(
		&userID,
		&passwordDB,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			ctx.SendJSON(401, goflow.H{
				"error": "invalid credentials",
			})
			return
		}

		ctx.SendJSON(500, goflow.H{
			"error": "Database error",
		})
		return
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(passwordDB),
		[]byte(req.Password),
	)

	if err != nil {
		ctx.SendJSON(401, goflow.H{
			"error": "invalid credentials",
		})
		return
	}

	claims := models.Claims{
		UserID:   userID,
		Username: req.Username,

		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt: jwt.NewNumericDate(
				time.Now(),
			),

			ExpiresAt: jwt.NewNumericDate(
				time.Now().Add(30 * time.Minute),
			),
		},
	}

	access := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		claims,
	)

	accessToken, err := access.SignedString([]byte(secretKey))

	if err != nil {
		ctx.SendJSON(500, goflow.H{
			"error": "jwt token error",
		})
		return
	}

	// Create refresh token
	randomToken, err := generateRefreshToken(64)

	if err != nil {
		randomToken = ""
	} else {
		sum := sha256.Sum256([]byte(randomToken))
		hashedToken := hex.EncodeToString(sum[:])

		_, err = store.DB.Exec(
			r.Context(),
			`
			INSERT INTO refresh_tokens (
				user_id, token, expires_at
			)
			VALUES ($1,$2,$3);
			`,
			userID,
			hashedToken,
			time.Now().Add(30*24*time.Hour),
		)

		if err != nil {
			randomToken = ""
		}
	}

	ctx.SendJSON(200, goflow.H{
		"message":      "login OK",
		"accessToken":  accessToken,
		"refreshToken": randomToken,
	})
}

func Refresh(
	w http.ResponseWriter,
	r *http.Request,
) {
	ctx := goflow.Context(w, r)

	secret := os.Getenv("JWT_SECRET")

	if secret == "" {
		ctx.SendJSON(500, goflow.H{
			"error": "secret error",
		})
		return
	}

	var req models.RefreshTokenReq

	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "invalid request",
		})

		return
	}

	if req.RefreshToken == "" {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "'token' is required",
		})

		return
	}

	refreshTokenHash := sha256.Sum256(
		[]byte(req.RefreshToken),
	)

	var (
		userID     int64
		usernameDB string
		expiresAt  time.Time
	)

	// start tx
	tx, err := store.DB.Begin(r.Context())
	if err != nil {
		ctx.SendJSON(500, goflow.H{
			"error": "tx error",
		})
		return
	}

	defer tx.Rollback(r.Context())

	err = tx.QueryRow(
		r.Context(),
		`
		SELECT user_id, expires_at
		FROM refresh_tokens
		WHERE token = $1;
		`,
		hex.EncodeToString(refreshTokenHash[:]),
	).Scan(
		&userID,
		&expiresAt,
	)

	if err != nil {

		if errors.Is(err, pgx.ErrNoRows) {
			ctx.SendJSON(409, goflow.H{
				"error": "invalid refresh token",
			})

			return
		}

		ctx.SendJSON(500, goflow.H{
			"error": "Database error",
		})

		return
	}

	err = tx.QueryRow(
		r.Context(),
		`
		SELECT username
		FROM users
		WHERE id = $1
		`,
		userID,
	).Scan(
		&usernameDB,
	)

	if err != nil {

		if errors.Is(err, pgx.ErrNoRows) {
			ctx.SendJSON(409, goflow.H{
				"error": "invalid credentials",
			})

			return
		}

		ctx.SendJSON(500, goflow.H{
			"error": "Database error",
		})

		return
	}

	if time.Now().After(expiresAt) {
		ctx.SendJSON(http.StatusUnauthorized, goflow.H{
			"error": "refresh token expired",
		})

		return
	}

	result, err := tx.Exec(
		r.Context(),
		`
		DELETE FROM refresh_tokens
		WHERE token = $1
		`,
		hex.EncodeToString(refreshTokenHash[:]),
	)

	if err != nil {
		ctx.SendJSON(500, goflow.H{
			"error": "database error",
		})

		return
	}

	if result.RowsAffected() == 0 {
		ctx.SendJSON(500, goflow.H{
			"error": "database error",
		})

		return
	}

	claims := models.Claims{
		UserID:   userID,
		Username: usernameDB,

		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt: jwt.NewNumericDate(
				time.Now(),
			),

			ExpiresAt: jwt.NewNumericDate(
				time.Now().Add(30 * time.Minute),
			),
		},
	}

	access := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		claims,
	)

	accessToken, err := access.SignedString([]byte(secret))

	if err != nil {
		ctx.SendJSON(500, goflow.H{
			"error": "jwt error",
		})
		return
	}

	randomToken, err := generateRefreshToken(64)

	if err != nil {
		ctx.SendJSON(500, goflow.H{
			"error": "refresh token generation error",
		})

		return
	}

	refreshToken := sha256.Sum256([]byte(randomToken))

	_, err = tx.Exec(
		r.Context(),
		`
		INSERT INTO refresh_tokens (user_id, token, expires_at)
		VALUES ($1,$2,$3)
		`,
		userID,
		hex.EncodeToString(refreshToken[:]),
		time.Now().Add(30*24*time.Hour),
	)

	if err != nil {
		ctx.SendJSON(500, goflow.H{
			"error": "database error",
		})

		return
	}

	err = tx.Commit(r.Context())

	if err != nil {
		ctx.SendJSON(500, goflow.H{
			"error": "tx commit error",
		})
		return
	}

	ctx.SendJSON(200, goflow.H{
		"accessToken":  accessToken,
		"refreshToken": randomToken,
	})
}

func GetMe(
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
		claims.UserID,
		claims.UserID,
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
		"id":       claims.UserID,
		"username": claims.Username,
		"mesflows": meshflows,
	})
}
