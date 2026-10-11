package models

import "github.com/golang-jwt/jwt/v5"

type RegisterReq struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginReq struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type Claims struct {
	UserID   int64  `json:"user_id"`
	Username string `json:"username"`

	jwt.RegisteredClaims
}

type RefreshTokenReq struct {
	RefreshToken string `json:"token"`
}
