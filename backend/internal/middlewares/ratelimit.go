package middlewares

import (
	"SourceMeshBackend/internal/store"
	"encoding/json"
	"net"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
)

// RateLimitByIP limits requests per client IP and per endpoint using Redis.
// Usage: r.With(middlewares.RateLimitByIP(100, time.Minute)).Post("/login", handler)
func RateLimitByIP(limit int, window time.Duration) func(http.Handler) http.Handler {
	if limit <= 0 {
		limit = 100
	}

	if window <= 0 {
		window = time.Minute
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := clientIP(r)
			key := rateLimitKey(r, ip)

			ctx := r.Context()

			count, err := store.RedisClient.Incr(ctx, key).Result()
			if err != nil {
				// Redis yoksa trafiği kesme, fail-open
				next.ServeHTTP(w, r)
				return
			}

			var ttl time.Duration
			if count == 1 {
				store.RedisClient.Expire(ctx, key, window)
				ttl = window
			} else {
				ttl, _ = store.RedisClient.TTL(ctx, key).Result()
			}

			remaining := 0
			if count < int64(limit) {
				remaining = limit - int(count)
			}

			w.Header().Set("X-RateLimit-Limit", strconv.Itoa(limit))
			w.Header().Set("X-RateLimit-Remaining", strconv.Itoa(remaining))
			if ttl > 0 {
				w.Header().Set("X-RateLimit-Reset", strconv.FormatInt(int64(ttl.Seconds()), 10))
			}

			if count > int64(limit) {
				if ttl > 0 {
					w.Header().Set("Retry-After", strconv.FormatInt(int64(ttl.Seconds()), 10))
				}
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusTooManyRequests)
				_ = json.NewEncoder(w).Encode(map[string]string{
					"error": "rate limit exceeded",
				})
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func rateLimitKey(r *http.Request, ip string) string {
	endpoint := r.URL.Path

	if routeCtx := chi.RouteContext(r.Context()); routeCtx != nil {
		if pattern := routeCtx.RoutePattern(); pattern != "" {
			endpoint = pattern
		}
	}

	return "ratelimit:" + r.Method + ":" + endpoint + ":" + ip
}

func clientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		if i := strings.Index(xff, ","); i != -1 {
			return strings.TrimSpace(xff[:i])
		}
		return strings.TrimSpace(xff)
	}

	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return strings.TrimSpace(xri)
	}

	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}

	return host
}
