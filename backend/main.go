package main

import (
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

	// Connect database
	store.ConnectPostresql()
	// Create tables
	store.CreateTables()

	// Router
	router := chi.NewRouter()

	router.Route("/api/v1", func(r chi.Router) {

	})

	// Start server
	fmt.Println("[INFO] Server starting on :8080")
	http.ListenAndServe(":8080", router)
}
