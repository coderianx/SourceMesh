package models

type RegisterReq struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
