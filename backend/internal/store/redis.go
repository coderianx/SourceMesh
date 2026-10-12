package store

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	MeshWriteCacheKey      = "meshwrites:latest"
	meshWriteCacheLimit    = 50
	meshWriteCacheInterval = 2 * time.Minute
)

var RedisClient = redis.NewClient(&redis.Options{
	Addr:     "localhost:6379",
	Password: "",
	DB:       0,
})

// CacheRedisClient keeps the meshwrite cache in a dedicated database (DB 1)
// so cached data never shares keyspace with the rate limit counters in DB 0.
var CacheRedisClient = redis.NewClient(&redis.Options{
	Addr:     "localhost:6379",
	Password: "",
	DB:       1,
})

var meshWriteCacheMu sync.Mutex

type MeshWriteCacheItem struct {
	ID        int64     `json:"id"`
	Username  string    `json:"username"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

func ConnectRedis() {
	err := RedisClient.Ping(context.Background()).Err()

	if err != nil {
		fmt.Println("[ERROR] Connect redis error")
		fmt.Println("Error: ", err)
		os.Exit(1)
	}

	err = CacheRedisClient.Ping(context.Background()).Err()

	if err != nil {
		fmt.Println("[ERROR] Connect cache redis error")
		fmt.Println("Error: ", err)
		os.Exit(1)
	}
}

func StartMeshWriteCache() {
	go func() {
		refreshMeshWriteCache()

		ticker := time.NewTicker(meshWriteCacheInterval)

		defer ticker.Stop()

		for range ticker.C {
			refreshMeshWriteCache()
		}
	}()
}

func refreshMeshWriteCache() {
	// Skip this round if the previous refresh is still running.
	if !meshWriteCacheMu.TryLock() {
		return
	}

	defer meshWriteCacheMu.Unlock()

	ctx := context.Background()

	rows, err := DB.Query(
		ctx,
		`
		SELECT id, username, title, content, created_at
		FROM meshwrites
		ORDER BY created_at DESC, id DESC
		LIMIT $1;
		`,
		meshWriteCacheLimit,
	)

	if err != nil {
		fmt.Println("[ERROR] MeshWrite cache query error")
		fmt.Println("Error: ", err)

		return
	}

	defer rows.Close()

	meshwrites := []MeshWriteCacheItem{}

	for rows.Next() {
		var (
			id        int64
			username  string
			title     string
			content   string
			createdAt time.Time
		)

		if err := rows.Scan(
			&id,
			&username,
			&title,
			&content,
			&createdAt,
		); err != nil {
			fmt.Println("[ERROR] MeshWrite cache scan error")
			fmt.Println("Error: ", err)

			return
		}

		meshwrites = append(meshwrites, MeshWriteCacheItem{
			ID:        id,
			Username:  username,
			Title:     title,
			Content:   content,
			CreatedAt: createdAt,
		})
	}

	if err := rows.Err(); err != nil {
		fmt.Println("[ERROR] MeshWrite cache rows error")
		fmt.Println("Error: ", err)

		return
	}

	cache, err := json.Marshal(meshwrites)

	if err != nil {
		fmt.Println("[ERROR] MeshWrite cache marshal error")
		fmt.Println("Error: ", err)

		return
	}

	if err := CacheRedisClient.Set(
		ctx,
		MeshWriteCacheKey,
		cache,
		3*meshWriteCacheInterval,
	).Err(); err != nil {
		fmt.Println("[ERROR] MeshWrite cache write error")
		fmt.Println("Error: ", err)

		return
	}

	fmt.Println("[INFO] MeshWrite cache refreshed")
}
