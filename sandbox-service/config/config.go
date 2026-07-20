package config

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"

	"gopkg.in/yaml.v3"
)

// Config holds the sandbox service configuration.
type Config struct {
	Port        int            `yaml:"port"`
	Sandbox     SandboxConfig  `yaml:"sandbox"`
	Compiler    CompilerConfig `yaml:"compiler"`
	PluginsDir  string         `yaml:"plugins_dir"`
	DatabaseURL          string `yaml:"database_url"`
	SupabaseURL          string `yaml:"supabase_url"`
	SupabaseServiceKey   string `yaml:"supabase_service_role_key"`
	SupabaseAnonKey      string `yaml:"supabase_anon_key"`
	CORSOrigins []string       `yaml:"cors_origins"`
	APIKey      string         `yaml:"api_key"`
	// Upstash Redis (optional — used for compile result caching)
	UpstashURL  string `yaml:"upstash_url"`
	UpstashToken string `yaml:"upstash_token"`
}

type SandboxConfig struct {
	RootDir string `yaml:"root_dir"`
}

type CompilerConfig struct {
	MaxMemoryMB           int `yaml:"max_memory_mb"`
	MaxJobMemoryMB        int `yaml:"max_job_memory_mb"`
	MaxCPUPercent         int `yaml:"max_cpu_percent"`
	MaxProcesses          int `yaml:"max_processes"`
	MaxConcurrentCompiles int `yaml:"max_concurrent_compiles"`
	TimeoutSeconds        int `yaml:"timeout_seconds"`
	InstallTimeoutSeconds int `yaml:"install_timeout_seconds"`
	CompileTimeoutSeconds int `yaml:"compile_timeout_seconds"`
	RunTimeoutSeconds     int `yaml:"run_timeout_seconds"`
}

// DefaultConfig returns a config with sensible defaults.
func DefaultConfig() *Config {
	return &Config{
		Port: 3002,
		Sandbox: SandboxConfig{
			RootDir: "../backend/sandbox_env",
		},
		Compiler: CompilerConfig{
			MaxMemoryMB:           1024,
			MaxJobMemoryMB:        1536,
			MaxCPUPercent:         75,
			MaxProcesses:          32,
			MaxConcurrentCompiles: 2,
			TimeoutSeconds:        180,
			InstallTimeoutSeconds: 300,
			CompileTimeoutSeconds: 180,
			RunTimeoutSeconds:     60,
		},
		PluginsDir:  "../backend/plugins",
		CORSOrigins: []string{
			"http://localhost:3000",
			"http://localhost:3001",
			"http://localhost:3005",
			"http://127.0.0.1:3000",
		},
	}
}

// Load reads config from a YAML file and environment variables.
// Environment variables override YAML values.
func Load(configPath string) (*Config, error) {
	LoadLocalEnv()

	cfg := DefaultConfig()

	// Try loading YAML config
	if configPath != "" {
		data, err := os.ReadFile(configPath)
		if err == nil {
			if err := yaml.Unmarshal(data, cfg); err != nil {
				return nil, fmt.Errorf("failed to parse config: %w", err)
			}
		}
	}

	// Environment variable overrides
	if port := os.Getenv("SANDBOX_PORT"); port != "" {
		if p, err := strconv.Atoi(port); err == nil {
			cfg.Port = p
		}
	}
	if rootDir := os.Getenv("SANDBOX_ROOT_DIR"); rootDir != "" {
		cfg.Sandbox.RootDir = rootDir
	}
	if pluginsDir := os.Getenv("SANDBOX_PLUGINS_DIR"); pluginsDir != "" {
		cfg.PluginsDir = pluginsDir
	}

	// Supabase REST (recommended — works over HTTPS, no direct Postgres needed)
	if supabaseURL := os.Getenv("SUPABASE_URL"); supabaseURL != "" {
		cfg.SupabaseURL = supabaseURL
	}
	if serviceKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY"); serviceKey != "" {
		cfg.SupabaseServiceKey = serviceKey
	}
	if anonKey := os.Getenv("SUPABASE_ANON_KEY"); anonKey != "" {
		cfg.SupabaseAnonKey = anonKey
	}

	// Direct Postgres fallback — supports SANDBOX_DB_URL and SUPABASE_DB_URL
	if dbURL := os.Getenv("SANDBOX_DB_URL"); dbURL != "" {
		cfg.DatabaseURL = dbURL
	} else if supabaseDBURL := os.Getenv("SUPABASE_DB_URL"); supabaseDBURL != "" {
		cfg.DatabaseURL = supabaseDBURL
	}

	if timeout := os.Getenv("SANDBOX_TIMEOUT"); timeout != "" {
		if t, err := strconv.Atoi(timeout); err == nil {
			cfg.Compiler.TimeoutSeconds = t
			cfg.Compiler.CompileTimeoutSeconds = t
		}
	}
	if value := os.Getenv("SANDBOX_MAX_MEMORY_MB"); value != "" {
		if v, err := strconv.Atoi(value); err == nil {
			cfg.Compiler.MaxMemoryMB = v
		}
	}
	if value := os.Getenv("SANDBOX_MAX_JOB_MEMORY_MB"); value != "" {
		if v, err := strconv.Atoi(value); err == nil {
			cfg.Compiler.MaxJobMemoryMB = v
		}
	}
	if value := os.Getenv("SANDBOX_MAX_CPU_PERCENT"); value != "" {
		if v, err := strconv.Atoi(value); err == nil {
			cfg.Compiler.MaxCPUPercent = v
		}
	}
	if value := os.Getenv("SANDBOX_MAX_PROCESSES"); value != "" {
		if v, err := strconv.Atoi(value); err == nil {
			cfg.Compiler.MaxProcesses = v
		}
	}
	if value := os.Getenv("SANDBOX_MAX_CONCURRENT_COMPILES"); value != "" {
		if v, err := strconv.Atoi(value); err == nil {
			cfg.Compiler.MaxConcurrentCompiles = v
		}
	}
	if value := os.Getenv("SANDBOX_INSTALL_TIMEOUT"); value != "" {
		if v, err := strconv.Atoi(value); err == nil {
			cfg.Compiler.InstallTimeoutSeconds = v
		}
	}
	if value := os.Getenv("SANDBOX_COMPILE_TIMEOUT"); value != "" {
		if v, err := strconv.Atoi(value); err == nil {
			cfg.Compiler.CompileTimeoutSeconds = v
		}
	}
	if value := os.Getenv("SANDBOX_RUN_TIMEOUT"); value != "" {
		if v, err := strconv.Atoi(value); err == nil {
			cfg.Compiler.RunTimeoutSeconds = v
		}
	}
	if apiKey := os.Getenv("SANDBOX_API_KEY"); apiKey != "" {
		cfg.APIKey = apiKey
	}
	if corsOrigins := os.Getenv("SANDBOX_CORS_ORIGINS"); corsOrigins != "" {
		cfg.CORSOrigins = splitAndTrim(corsOrigins, ",")
	}

	// Upstash Redis (optional — for compile result caching)
	if upstashURL := os.Getenv("SANDBOX_UPSTASH_REDIS_REST_URL"); upstashURL != "" {
		cfg.UpstashURL = upstashURL
	}
	if upstashToken := os.Getenv("SANDBOX_UPSTASH_REDIS_REST_TOKEN"); upstashToken != "" {
		cfg.UpstashToken = upstashToken
	}

	// Resolve relative paths to absolute
	cfg.Sandbox.RootDir = resolvePath(cfg.Sandbox.RootDir)
	cfg.PluginsDir = resolvePath(cfg.PluginsDir)

	return cfg, nil
}

func resolvePath(p string) string {
	if filepath.IsAbs(p) {
		return p
	}
	abs, err := filepath.Abs(p)
	if err != nil {
		return p
	}
	return abs
}

func splitAndTrim(s string, sep string) []string {
	parts := make([]string, 0)
	for _, p := range filepath.SplitList(s) {
		p = filepath.Clean(p)
		if p != "" {
			parts = append(parts, p)
		}
	}
	// Fallback to manual split for comma-separated
	if len(parts) <= 1 {
		parts = make([]string, 0)
		for _, segment := range splitStr(s, sep) {
			trimmed := trimSpace(segment)
			if trimmed != "" {
				parts = append(parts, trimmed)
			}
		}
	}
	return parts
}

func splitStr(s, sep string) []string {
	result := make([]string, 0)
	for len(s) > 0 {
		i := indexOf(s, sep)
		if i < 0 {
			result = append(result, s)
			break
		}
		result = append(result, s[:i])
		s = s[i+len(sep):]
	}
	return result
}

func indexOf(s, sub string) int {
	for i := 0; i <= len(s)-len(sub); i++ {
		if s[i:i+len(sub)] == sub {
			return i
		}
	}
	return -1
}

func trimSpace(s string) string {
	start := 0
	end := len(s)
	for start < end && (s[start] == ' ' || s[start] == '\t') {
		start++
	}
	for end > start && (s[end-1] == ' ' || s[end-1] == '\t') {
		end--
	}
	return s[start:end]
}
