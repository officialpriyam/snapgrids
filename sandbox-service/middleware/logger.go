package middleware

import (
	"log"
	"net/http"
	"time"
)

// Logger is a simple HTTP request logging middleware
func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		log.Printf("[Sandbox Service] %s %s from %s", r.Method, r.URL.Path, r.RemoteAddr)
		next.ServeHTTP(w, r)
		log.Printf("[Sandbox Service] Completed %s %s in %v", r.Method, r.URL.Path, time.Since(start))
	})
}
