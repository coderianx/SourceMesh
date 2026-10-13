package nodes

import (
	"SourceMeshBackend/internal/middlewares"
	"SourceMeshBackend/internal/models"
	"SourceMeshBackend/internal/store"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/coderianx/goflow"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

func CreateNewNodes(
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

	var req models.CreateNewNodesReq

	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "invalid request",
		})
		return
	}

	if req.Name == "" {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "name is required",
		})
		return
	}

	if len(req.Name) > 75 {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "name is too long",
		})
		return
	}

	if req.Desc == "" {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "description is required",
		})
		return
	}

	if len(req.Desc) > 300 {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "description is too long",
		})
		return
	}

	tx, err := store.DB.Begin(r.Context())

	if err != nil {
		ctx.SendJSON(500, goflow.H{
			"error": "tx error",
		})
		return
	}

	defer tx.Rollback(r.Context())

	var nodeId int64

	err = tx.QueryRow(
		r.Context(),
		`
		INSERT INTO nodes (
			name, description
		)
		VALUES ($1,$2)
		RETURNING id;
		`,
		req.Name,
		req.Desc,
	).Scan(
		&nodeId,
	)

	if err != nil {
		var pgErr *pgconn.PgError

		if errors.As(err, &pgErr) {
			if pgErr.Code == "23505" {
				ctx.SendJSON(409, goflow.H{
					"error": "This name is already taken.",
				})
				return
			}
		}

		ctx.SendJSON(500, goflow.H{
			"error": "database error",
		})
		return
	}

	_, err = tx.Exec(
		r.Context(),
		`
		INSERT INTO nodes_members (
			node_id,user_id, username, role
		)
		VALUES ($1,$2,$3,$4);
		`,
		nodeId,
		claims.UserID,
		claims.Username,
		"owner",
	)

	if err != nil {
		var pgErr *pgconn.PgError

		if errors.As(err, &pgErr) {
			if pgErr.Code == "23505" {
				ctx.SendJSON(409, goflow.H{
					"error": "You are already a member of this node.",
				})
				return
			}
		}

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

	ctx.SendJSON(201, goflow.H{
		"message":     "node created",
		"id":          nodeId,
		"name":        req.Name,
		"description": req.Desc,
	})
}

func JoinNode(
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

	name := chi.URLParam(r, "name")

	if name == "" {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "name is required",
		})
		return
	}

	var exists bool

	err := store.DB.QueryRow(
		r.Context(),
		`
		SELECT EXISTS (
			SELECT 1
			FROM nodes
			WHERE name = $1
		);
		`,
		name,
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
			"error": "node not found",
		})
		return
	}

	result, err := store.DB.Exec(
		r.Context(),
		`
		INSERT INTO nodes_members (
			node_id, user_id, username, role
		)
		SELECT id, $1, $2, 'member'
		FROM nodes
		WHERE name = $3;
		`,
		claims.UserID,
		claims.Username,
		name,
	)

	if err != nil {
		var pgErr *pgconn.PgError

		if errors.As(err, &pgErr) {
			if pgErr.Code == "23505" {
				ctx.SendJSON(409, goflow.H{
					"error": "You are already a member of this node.",
				})
				return
			}
		}

		ctx.SendJSON(500, goflow.H{
			"error": "database error",
		})
		return
	}

	// The node may have been deleted between the existence check and the
	// insert, in which case the SELECT matches no row.
	if result.RowsAffected() == 0 {
		ctx.SendJSON(404, goflow.H{
			"error": "node not found",
		})
		return
	}

	ctx.SendJSON(201, goflow.H{
		"message": "node joined",
		"name":    name,
	})
}

func LeaveNode(
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

	name := chi.URLParam(r, "name")

	if name == "" {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "name is required",
		})
		return
	}

	result, err := store.DB.Exec(
		r.Context(),
		`
		DELETE FROM nodes_members
		WHERE user_id = $1
		  AND node_id = (
			SELECT id
			FROM nodes
			WHERE name = $2
		  );
		`,
		claims.UserID,
		name,
	)

	if err != nil {
		ctx.SendJSON(500, goflow.H{
			"error": "database error",
		})
		return
	}

	if result.RowsAffected() == 0 {
		ctx.SendJSON(404, goflow.H{
			"error": "membership not found",
		})
		return
	}

	ctx.SendJSON(200, goflow.H{
		"message": "node left",
		"name":    name,
	})
}

// CreateNewPostInNode creates a post inside a node. Only members of the
// node can post.
func CreateNewPostInNode(
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

	name := chi.URLParam(r, "name")

	if name == "" {
		ctx.SendJSON(http.StatusBadRequest, goflow.H{
			"error": "name is required",
		})
		return
	}

	var req models.CreateNewPostInNodeReq

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
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

	var (
		nodeID   int64
		isMember bool
	)

	err := store.DB.QueryRow(
		r.Context(),
		`
		SELECT n.id, EXISTS (
			SELECT 1
			FROM nodes_members m
			WHERE m.node_id = n.id
			  AND m.user_id = $2
		)
		FROM nodes n
		WHERE n.name = $1;
		`,
		name,
		claims.UserID,
	).Scan(
		&nodeID,
		&isMember,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			ctx.SendJSON(http.StatusNotFound, goflow.H{
				"error": "node not found",
			})
			return
		}

		ctx.SendJSON(500, goflow.H{
			"error": "database error",
		})
		return
	}

	if !isMember {
		ctx.SendJSON(http.StatusForbidden, goflow.H{
			"error": "you are not a member of this node",
		})
		return
	}

	var (
		postID    int64
		createdAt time.Time
	)

	err = store.DB.QueryRow(
		r.Context(),
		`
		INSERT INTO node_posts (
			node_id, user_id, username, title, content
		)
		VALUES ($1,$2,$3,$4,$5)
		RETURNING id, created_at;
		`,
		nodeID,
		claims.UserID,
		claims.Username,
		req.Title,
		req.Content,
	).Scan(
		&postID,
		&createdAt,
	)

	if err != nil {
		ctx.SendJSON(500, goflow.H{
			"error": "database error",
		})
		return
	}

	ctx.SendJSON(http.StatusCreated, goflow.H{
		"message":    "post created",
		"id":         postID,
		"node_id":    nodeID,
		"title":      req.Title,
		"content":    req.Content,
		"created_at": createdAt,
	})
}

// ListTopNodes returns the five nodes with the most members.
func ListTopNodes(
	w http.ResponseWriter,
	r *http.Request,
) {
	ctx := goflow.Context(w, r)

	rows, err := store.DB.Query(
		r.Context(),
		`
		SELECT
			n.id,
			n.name,
			n.description,
			COUNT(m.id) AS member_count
		FROM nodes n
		LEFT JOIN nodes_members m ON m.node_id = n.id
		GROUP BY n.id
		ORDER BY member_count DESC, n.name ASC
		LIMIT 5;
		`,
	)

	if err != nil {
		ctx.SendJSON(500, goflow.H{
			"error": "database error",
		})
		return
	}

	defer rows.Close()

	nodes := []goflow.H{}

	for rows.Next() {
		var (
			id          int64
			name        string
			description string
			memberCount int64
		)

		if err := rows.Scan(
			&id,
			&name,
			&description,
			&memberCount,
		); err != nil {
			ctx.SendJSON(500, goflow.H{
				"error": "database error",
			})
			return
		}

		nodes = append(nodes, goflow.H{
			"id":           id,
			"name":         name,
			"description":  description,
			"member_count": memberCount,
		})
	}

	if err := rows.Err(); err != nil {
		ctx.SendJSON(500, goflow.H{
			"error": "database error",
		})
		return
	}

	ctx.SendJSON(http.StatusOK, goflow.H{
		"nodes": nodes,
	})
}

// ListJoinedNodes returns the nodes the user is a member of.
func ListJoinedNodes(
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
			n.id,
			n.name,
			n.description,
			m.role,
			(
				SELECT COUNT(*)
				FROM nodes_members c
				WHERE c.node_id = n.id
			) AS member_count
		FROM nodes_members m
		JOIN nodes n ON n.id = m.node_id
		WHERE m.user_id = $1
		ORDER BY n.name ASC;
		`,
		claims.UserID,
	)

	if err != nil {
		ctx.SendJSON(500, goflow.H{
			"error": "database error",
		})
		return
	}

	defer rows.Close()

	nodes := []goflow.H{}

	for rows.Next() {
		var (
			id          int64
			name        string
			description string
			role        string
			memberCount int64
		)

		if err := rows.Scan(
			&id,
			&name,
			&description,
			&role,
			&memberCount,
		); err != nil {
			ctx.SendJSON(500, goflow.H{
				"error": "database error",
			})
			return
		}

		nodes = append(nodes, goflow.H{
			"id":           id,
			"name":         name,
			"description":  description,
			"role":         role,
			"member_count": memberCount,
		})
	}

	if err := rows.Err(); err != nil {
		ctx.SendJSON(500, goflow.H{
			"error": "database error",
		})
		return
	}

	ctx.SendJSON(http.StatusOK, goflow.H{
		"nodes": nodes,
	})
}
