package models

type CreateNewNodesReq struct {
	Name string `json:"name"`
	Desc string `json:"description"`
}

type CreateNewPostInNodeReq struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}
