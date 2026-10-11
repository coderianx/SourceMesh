package middlewares

import (
	"SourceMeshBackend/internal/models"
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type ctxKey string

const (
	claimsKey   ctxKey = "claims"
	userIDKey   ctxKey = "userID"
	usernameKey ctxKey = "username"
)

// Auth validates JWT from Authorization: Bearer <token> header,
// puts models.Claims into request context and calls next.
// Usage: r.With(middlewares.Auth).Get("/me", handler)
func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			writeAuthError(w, http.StatusInternalServerError, "secret error")
			return
		}

		header := r.Header.Get("Authorization")
		if header == "" {
			writeAuthError(w, http.StatusUnauthorized, "missing authorization header")
			return
		}

		parts := strings.SplitN(header, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") || parts[1] == "" {
			writeAuthError(w, http.StatusUnauthorized, "invalid authorization header")
			return
		}

		tokenStr := parts[1]

		claims := &models.Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			writeAuthError(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}

		ctx := context.WithValue(r.Context(), claimsKey, claims)
		ctx = context.WithValue(ctx, userIDKey, claims.UserID)
		ctx = context.WithValue(ctx, usernameKey, claims.Username)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetClaims returns models.Claims stored by Auth middleware.
func GetClaims(r *http.Request) (*models.Claims, bool) {
	claims, ok := r.Context().Value(claimsKey).(*models.Claims)
	return claims, ok && claims != nil
}

// GetUserID returns user_id stored by Auth middleware.
func GetUserID(r *http.Request) (int64, bool) {
	id, ok := r.Context().Value(userIDKey).(int64)
	return id, ok
}

// GetUsername returns username stored by Auth middleware.
func GetUsername(r *http.Request) (string, bool) {
	username, ok := r.Context().Value(usernameKey).(string)
	return username, ok
}

func writeAuthError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"error": msg,
	})
}
