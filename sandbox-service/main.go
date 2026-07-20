package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"kodari/sandbox-service/cache"
	"kodari/sandbox-service/compiler"
	"kodari/sandbox-service/config"
	"kodari/sandbox-service/handlers"
	"kodari/sandbox-service/middleware"
	"kodari/sandbox-service/storage"
)

func main() {
	log.Println("[Sandbox Service] Starting...")

	// Load configuration
	configPath := "config.yml"
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		if _, err := os.Stat("../backend/config.yml"); err == nil {
			log.Println("[Sandbox Service] Config file found in backend directory, but using defaults with absolute path resolution for safety")
		}
		configPath = ""
	}

	cfg, err := config.Load(configPath)
	if err != nil {
		log.Fatalf("[Sandbox Service] Failed to load config: %v", err)
	}

	log.Printf("[Sandbox Service] Loaded Config: Port=%d, SandboxDir=%s, PluginsDir=%s",
		cfg.Port, cfg.Sandbox.RootDir, cfg.PluginsDir)

	// Log API key authentication status
	if cfg.APIKey != "" {
		log.Println("[Sandbox Service] API Key authentication is ENABLED — remote connections require Authorization header")
	} else {
		log.Println("[Sandbox Service] API Key authentication is DISABLED — running in local development mode")
	}

	// Initialize compile history storage (Supabase REST preferred)
	db, err := storage.NewStore(storage.StoreConfig{
		DatabaseURL:        cfg.DatabaseURL,
		SupabaseURL:        cfg.SupabaseURL,
		SupabaseServiceKey: cfg.SupabaseServiceKey,
		SupabaseAnonKey:    cfg.SupabaseAnonKey,
	})
	if err != nil {
		log.Fatalf("[Sandbox Service] Failed to connect to database: %v", err)
	}
	defer db.Close()
	if cfg.SupabaseURL != "" && (cfg.SupabaseServiceKey != "" || cfg.SupabaseAnonKey != "") {
		log.Println("[Sandbox Service] Supabase REST connection established")
	} else {
		log.Println("[Sandbox Service] PostgreSQL connection established")
	}

	// Initialize Upstash Redis (optional — for compile result caching)
	redis := cache.NewRedis(cfg.UpstashURL, cfg.UpstashToken)
	if redis.IsConfigured() {
		if err := redis.Ping(); err != nil {
			log.Printf("[Sandbox Service] Redis configured but ping failed: %v — caching disabled", err)
		} else {
			log.Println("[Sandbox Service] Redis cache connected — compile history caching enabled")
		}
	} else {
		log.Println("[Sandbox Service] Redis not configured — compile history caching disabled")
	}

	// Initialize plugin manager
	pm := compiler.NewPluginManager(cfg.PluginsDir)
	log.Printf("[Sandbox Service] Plugins initialized. Loaded %d plugins", len(pm.GetAllPlugins()))

	// Initialize compile executor with resource limits
	executor := compiler.NewExecutor(cfg.Compiler.ResourceLimits())
	log.Printf("[Sandbox Service] Resource limits: heap=%dMB job=%dMB cpu=%d%% concurrent=%d",
		cfg.Compiler.MaxMemoryMB,
		cfg.Compiler.MaxJobMemoryMB,
		cfg.Compiler.MaxCPUPercent,
		cfg.Compiler.MaxConcurrentCompiles,
	)

	// Initialize router and handlers
	h := handlers.NewHandler(cfg, pm, executor, db, redis)
	r := mux.NewRouter()

	// Routes
	r.HandleFunc("/health", h.Health).Methods("GET")
	r.HandleFunc("/compile/run", h.Run).Methods("POST")
	r.HandleFunc("/compile/compile", h.Compile).Methods("POST")
	r.HandleFunc("/compile/status/{sessionId}", h.Status).Methods("GET")
	r.HandleFunc("/compile/history/{sessionId}", h.History).Methods("GET")
	r.HandleFunc("/compile/artifact/{historyId}", h.Artifact).Methods("GET")

	// Middleware — API key auth runs first, then logger
	r.Use(middleware.APIKeyAuth)
	r.Use(middleware.Logger)

	// CORS handler
	c := cors.New(cors.Options{
		AllowedOrigins:   cfg.CORSOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	// Start server
	addr := fmt.Sprintf(":%d", cfg.Port)
	log.Printf("[Sandbox Service] Server listening on %s", addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatalf("[Sandbox Service] Server error: %v", err)
	}
}
