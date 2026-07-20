package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	"kodari/sandbox-service/cache"
	"kodari/sandbox-service/compiler"
	"kodari/sandbox-service/config"
	"kodari/sandbox-service/sandbox"
	"kodari/sandbox-service/storage"
)

const compileHistoryCacheTTL = 300 // 5 minutes

type Handler struct {
	cfg      *config.Config
	pm       *compiler.PluginManager
	executor *compiler.Executor
	db       storage.Store
	redis    *cache.Redis
}

func NewHandler(cfg *config.Config, pm *compiler.PluginManager, executor *compiler.Executor, db storage.Store, redis *cache.Redis) *Handler {
	return &Handler{
		cfg:      cfg,
		pm:       pm,
		executor: executor,
		db:       db,
		redis:    redis,
	}
}

type RunRequest struct {
	Language  string            `json:"language"`
	Code      string            `json:"code,omitempty"`
	SessionID string            `json:"sessionId"`
	Files     map[string]string `json:"files,omitempty"`
}

type CompileRequest struct {
	Language  string `json:"language"`
	SessionID string `json:"sessionId"`
}

func (h *Handler) Run(w http.ResponseWriter, r *http.Request) {
	var req RunRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Language == "" || req.SessionID == "" {
		http.Error(w, "Language and sessionId are required", http.StatusBadRequest)
		return
	}
	if err := sandbox.ValidateSessionID(req.SessionID); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	plugin := h.pm.GetPlugin(req.Language)
	if plugin == nil {
		http.Error(w, fmt.Sprintf("Plugin not found: %s", req.Language), http.StatusBadRequest)
		return
	}

	ctx := sandbox.NewContext(h.cfg.Sandbox.RootDir, req.SessionID)

	// Save single code file or files map if provided
	if req.Code != "" {
		defaultFile := "src/main/java/Main.java"
		if req.Language == "kotlin" {
			defaultFile = "src/main/kotlin/Main.kt"
		} else if len(plugin.DefaultFileStructure) > 0 {
			defaultFile = plugin.DefaultFileStructure[0]
		}
		if err := ctx.WriteFile(defaultFile, req.Code); err != nil {
			http.Error(w, fmt.Sprintf("failed to save code file: %v", err), http.StatusInternalServerError)
			return
		}
	} else if len(req.Files) > 0 {
		for fPath, content := range req.Files {
			if err := ctx.WriteFile(fPath, content); err != nil {
				http.Error(w, fmt.Sprintf("failed to save file %s: %v", fPath, err), http.StatusInternalServerError)
				return
			}
		}
	}

	result, _, err := h.runCompilation(req.Language, req.SessionID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Invalidate compile history cache for this session after a new compilation
	h.invalidateHistoryCache(req.SessionID)

	// Fetch latest history ID for this session so frontend can download artifact
	historyID := h.getLatestHistoryID(req.SessionID)

	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"success":   result.Success,
		"log":       result.Log,
		"stages":    result.Stages,
		"historyId": historyID,
	})
}

func (h *Handler) getLatestHistoryID(sessionID string) int64 {
	records, err := h.db.GetCompileHistory(sessionID)
	if err != nil || len(records) == 0 {
		return 0
	}
	return records[0].ID
}

func (h *Handler) Compile(w http.ResponseWriter, r *http.Request) {
	var req CompileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Language == "" || req.SessionID == "" {
		http.Error(w, "Language and sessionId are required", http.StatusBadRequest)
		return
	}
	if err := sandbox.ValidateSessionID(req.SessionID); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, _, err := h.runCompilation(req.Language, req.SessionID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Invalidate compile history cache after a new compilation
	h.invalidateHistoryCache(req.SessionID)

	compSuccess := false
	compLog := result.Log
	if result.Stages.Compilation != nil {
		compSuccess = result.Stages.Compilation.Success
		compLog = fmt.Sprintf("=== Compilation ===\n%s\n%s", result.Stages.Compilation.Stdout, result.Stages.Compilation.Stderr)
	}

	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"success":   compSuccess,
		"log":       compLog,
		"historyId": h.getLatestHistoryID(req.SessionID),
	})
}

func (h *Handler) Status(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sessionID := vars["sessionId"]
	if sessionID == "" {
		http.Error(w, "sessionId is required", http.StatusBadRequest)
		return
	}
	if err := sandbox.ValidateSessionID(sessionID); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ctx := sandbox.NewContext(h.cfg.Sandbox.RootDir, sessionID)
	if !ctx.Exists() {
		http.Error(w, "session not found", http.StatusNotFound)
		return
	}

	allFiles, err := ctx.ListFiles()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	hidePatterns := []string{
		"target/",
		".git/",
		"node_modules/",
		".DS_Store",
		".idea/",
		".vscode/",
		"build/",
	}

	var files []string
	for _, f := range allFiles {
		shouldHide := false
		for _, p := range hidePatterns {
			if strings.HasPrefix(f, p) || strings.Contains(f, "/"+p) {
				shouldHide = true
				break
			}
		}
		if !shouldHide {
			files = append(files, f)
		}
	}

	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"sessionId": sessionID,
		"fileCount": len(files),
		"files":     files,
	})
}

func (h *Handler) History(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sessionID := vars["sessionId"]
	if sessionID == "" {
		http.Error(w, "sessionId is required", http.StatusBadRequest)
		return
	}
	if err := sandbox.ValidateSessionID(sessionID); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Try Redis cache first
	cacheKey := fmt.Sprintf("compile_history:%s", sessionID)
	if h.redis != nil && h.redis.IsConfigured() {
		cached, err := h.redis.Get(cacheKey)
		if err == nil && cached != nil {
			// Cache hit — return cached history
			if data, ok := cached.([]interface{}); ok {
				records := make([]storage.CompileHistoryRecord, 0, len(data))
				for _, item := range data {
					if itemMap, ok := item.(map[string]interface{}); ok {
						records = append(records, mapToRecord(itemMap))
					}
				}
				jsonResponse(w, http.StatusOK, records)
				return
			}
		}
	}

	// Cache miss or Redis not configured — query database
	records, err := h.db.GetCompileHistory(sessionID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if records == nil {
		records = []storage.CompileHistoryRecord{}
	}

	// Store in Redis cache
	if h.redis != nil && h.redis.IsConfigured() {
		if cacheErr := h.redis.Set(cacheKey, records, compileHistoryCacheTTL); cacheErr != nil {
			log.Printf("[Redis] Failed to cache history for %s: %v", sessionID, cacheErr)
		}
	}

	jsonResponse(w, http.StatusOK, records)
}

func (h *Handler) Artifact(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	historyIDStr := vars["historyId"]
	historyID, err := strconv.ParseInt(historyIDStr, 10, 64)
	if err != nil {
		http.Error(w, "invalid historyId", http.StatusBadRequest)
		return
	}

	sessionID, artifactPath, err := h.db.GetArtifactByID(historyID)
	if err != nil {
		http.Error(w, "Artifact not found for this build", http.StatusNotFound)
		return
	}

	ctx := sandbox.NewContext(h.cfg.Sandbox.RootDir, sessionID)
	fullPath := filepath.Join(ctx.GetRootDir(), artifactPath)

	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		http.Error(w, "Artifact file missing from disk", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filepath.Base(fullPath)))
	http.ServeFile(w, r, fullPath)
}

func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	health := map[string]interface{}{"status": "ok"}

	// Report Redis status
	if h.redis != nil && h.redis.IsConfigured() {
		if err := h.redis.Ping(); err != nil {
			health["redis"] = "error"
		} else {
			health["redis"] = "ok"
		}
	} else {
		health["redis"] = "not_configured"
	}

	jsonResponse(w, http.StatusOK, health)
}

// invalidateHistoryCache removes cached compile history for a session
// after a new compilation event (so next request fetches fresh data).
func (h *Handler) invalidateHistoryCache(sessionID string) {
	if h.redis != nil && h.redis.IsConfigured() {
		cacheKey := fmt.Sprintf("compile_history:%s", sessionID)
		if _, err := h.redis.Del(cacheKey); err != nil {
			log.Printf("[Redis] Failed to invalidate cache for %s: %v", sessionID, err)
		}
	}
}

// mapToRecord converts a generic map (from Redis JSON) back into a CompileHistoryRecord.
func mapToRecord(m map[string]interface{}) storage.CompileHistoryRecord {
	var r storage.CompileHistoryRecord

	if id, ok := m["id"].(float64); ok {
		r.ID = int64(id)
	}
	if sid, ok := m["session_id"].(string); ok {
		r.SessionID = sid
	}
	if success, ok := m["success"].(float64); ok {
		r.Success = int(success)
	}
	if log, ok := m["log"].(string); ok {
		r.Log = log
	}
	if ap, ok := m["artifact_path"]; ok {
		if s, ok := ap.(string); ok && s != "" {
			r.ArtifactPath = &s
		}
	}
	if ca, ok := m["created_at"].(string); ok {
		r.CreatedAt = ca
	}

	return r
}

func (h *Handler) runCompilation(language string, sessionID string) (compiler.CompilationResult, string, error) {
	plugin := h.pm.GetPlugin(language)
	if plugin == nil {
		return compiler.CompilationResult{}, "", fmt.Errorf("plugin not found: %s", language)
	}

	ctx := sandbox.NewContext(h.cfg.Sandbox.RootDir, sessionID)
	result := compiler.CompilationResult{
		Success: false,
		Log:     "",
		Stages:  &compiler.CompilationStages{},
	}

	validationErrors := sandbox.ValidateProjectStructure(ctx, language)
	if len(validationErrors) > 0 {
		result.Log = fmt.Sprintf("Pre-compilation validation failed:\n%s", strings.Join(validationErrors, "\n"))
		_, _ = h.db.AddCompileHistory(sessionID, false, result.Log, "")
		return result, "", nil
	}

	cmds := plugin.CompilerCommands
	bgCtx := context.Background()

	if cmds.Install != "" {
		res, err := h.executor.Execute(bgCtx, cmds.Install, ctx.GetRootDir(), compiler.StageInstall)
		if err != nil {
			result.Log = fmt.Sprintf("Install execution failed: %v", err)
			_, _ = h.db.AddCompileHistory(sessionID, false, result.Log, "")
			return result, "", nil
		}
		result.Stages.DependencyInstall = res
		if !res.Success {
			result.Log = compiler.FormatStageOutput("Dependency Installation", res)
			_, _ = h.db.AddCompileHistory(sessionID, false, result.Log, "")
			return result, "", nil
		}
	}

	if cmds.Compile != "" {
		res, err := h.executor.Execute(bgCtx, cmds.Compile, ctx.GetRootDir(), compiler.StageCompile)
		if err != nil {
			result.Log = fmt.Sprintf("Compile execution failed: %v", err)
			_, _ = h.db.AddCompileHistory(sessionID, false, result.Log, "")
			return result, "", nil
		}
		result.Stages.Compilation = res
		if !res.Success {
			result.Log = compiler.FormatStageOutput("Compilation", res)
			_, _ = h.db.AddCompileHistory(sessionID, false, result.Log, "")
			return result, "", nil
		}
	}

	var artifactPath string
	if (result.Stages.Compilation != nil && result.Stages.Compilation.Success) ||
		(cmds.Compile == "" && result.Stages.DependencyInstall != nil && result.Stages.DependencyInstall.Success) {
		artifactPath = compiler.FindArtifact(ctx.GetRootDir())
	}

	if cmds.Run != "" {
		res, err := h.executor.Execute(bgCtx, cmds.Run, ctx.GetRootDir(), compiler.StageRun)
		if err != nil {
			result.Log = fmt.Sprintf("Run execution failed: %v", err)
			_, _ = h.db.AddCompileHistory(sessionID, false, result.Log, "")
			return result, "", nil
		}
		result.Stages.Execution = res
		result.Success = res.Success
		result.Log = compiler.FormatAllStages(result.Stages)
	} else {
		result.Success = true
		result.Log = compiler.FormatAllStages(result.Stages)
	}

	_, _ = h.db.AddCompileHistory(sessionID, result.Success, result.Log, artifactPath)
	return result, artifactPath, nil
}

func jsonResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}
