package middleware

import (
	"net/http"
	"os"
	"strings"
)

// APIKeyAuth middleware validates the Authorization header against the SANDBOX_API_KEY env var.
// If SANDBOX_API_KEY is empty or unset, authentication is skipped (local dev mode).
// When set, every request must include "Authorization: Bearer <key>" matching the env value.
func APIKeyAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		expectedKey := os.Getenv("SANDBOX_API_KEY")

		// If no API key is configured, skip auth (local development mode)
		if expectedKey == "" {
			next.ServeHTTP(w, r)
			return
		}

		// Allow health checks without auth for monitoring
		if r.URL.Path == "/health" {
			next.ServeHTTP(w, r)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, `{"error":"Missing Authorization header"}`, http.StatusUnauthorized)
			return
		}

		// Expect "Bearer <token>"
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			http.Error(w, `{"error":"Invalid Authorization format. Use: Bearer <api_key>"}`, http.StatusUnauthorized)
			return
		}

		token := strings.TrimSpace(parts[1])
		if token != expectedKey {
			http.Error(w, `{"error":"Invalid API key"}`, http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}
