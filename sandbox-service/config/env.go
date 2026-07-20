package config

import (
	"bufio"
	"os"
	"path/filepath"
	"strings"
)

// LoadEnvFile reads KEY=VALUE pairs from a .env file into the process environment.
// Existing environment variables are not overwritten.
func LoadEnvFile(path string) error {
	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}

		key = strings.TrimSpace(key)
		value = strings.TrimSpace(value)
		value = strings.Trim(value, `"'`)

		if key == "" || os.Getenv(key) != "" {
			continue
		}

		_ = os.Setenv(key, value)
	}

	return scanner.Err()
}

// LoadLocalEnv loads .env from the sandbox-service directory when present.
func LoadLocalEnv() {
	candidates := []string{".env"}
	if exe, err := os.Executable(); err == nil {
		candidates = append(candidates, filepath.Join(filepath.Dir(exe), ".env"))
	}

	for _, path := range candidates {
		if err := LoadEnvFile(path); err == nil {
			return
		}
	}
}
