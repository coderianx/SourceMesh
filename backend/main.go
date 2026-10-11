package main

import (
	"SourceMeshBackend/internal/handlers/auth"
	"SourceMeshBackend/internal/store"
	"fmt"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	err := godotenv.Load()

	if err != nil {
		fmt.Println("[ERROR] Load .env file error\nErr: ", err)
		os.Exit(1)
	}

	// Connect redis
	store.ConnectRedis()
	// Connect database
	store.ConnectPostresql()
	// Create tables
	store.CreateTables()

	// Router
	router := chi.NewRouter()

	router.Route("/api/v1", func(r chi.Router) {
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", auth.Register)
			r.Post("/login", auth.Login)
			r.Post("/refresh", auth.Refresh)
		})
	})

	// Start server
	fmt.Println("[INFO] Server starting on :8080")
	http.ListenAndServe(":8080", router)
}
