package main

import (
	"SourceMeshBackend/internal/handlers/auth"
	"SourceMeshBackend/internal/handlers/meshflow"
	"SourceMeshBackend/internal/middlewares"
	"SourceMeshBackend/internal/store"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
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

	router.Use(middleware.Logger)

	router.Route("/api/v1", func(r chi.Router) {
		r.Route("/auth", func(r chi.Router) {
			r.With(
				middlewares.RateLimitByIP(5, time.Minute),
			).Post(
				"/register", auth.Register,
			)

			r.With(
				middlewares.RateLimitByIP(5, time.Minute),
			).Post(
				"/login", auth.Login,
			)

			r.With(
				middlewares.RateLimitByIP(5, time.Minute),
			).Post(
				"/refresh", auth.Refresh,
			)

			r.With(
				middlewares.Auth,
				middlewares.RateLimitByIP(
					30, time.Minute,
				),
			).Get(
				"/me", auth.GetMe,
			)
		})

		r.With(
			middlewares.RateLimitByIP(
				15,
				time.Minute,
			),
			middlewares.Auth,
		).Post(
			"/meshflow", meshflow.CreateMeshFlow,
		)

		r.With(
			middlewares.Auth,
			middlewares.RateLimitByIP(
				15, time.Minute,
			),
		).Delete(
			"/meshflow/{id}", meshflow.DeleteMeshflow,
		)

	})

	// Start server
	fmt.Println("[INFO] Server starting on :8080")
	http.ListenAndServe(":8080", router)
}
