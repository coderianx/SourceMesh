package store

import (
	"context"
	"fmt"
	"os"

	"github.com/redis/go-redis/v9"
)

var RedisClient = redis.NewClient(&redis.Options{
	Addr:     "localhost:6379",
	Password: "",
	DB:       0,
})

func ConnectRedis() {
	err := RedisClient.Ping(context.Background()).Err()

	if err != nil {
		fmt.Println("[ERROR] Connect redis error")
		fmt.Println("Error: ", err)
		os.Exit(1)
	}
}
