package compiler

import (
	"fmt"
	"os"
	"strconv"
)

// ResourceLimits caps CPU, memory, and process count for each compile job.
type ResourceLimits struct {
	MaxMemoryMB           int
	MaxJobMemoryMB        int
	MaxCPUPercent         int
	MaxProcesses          int
	MaxConcurrentCompiles int
	InstallTimeoutSeconds int
	CompileTimeoutSeconds int
	RunTimeoutSeconds     int
}

func DefaultResourceLimits() ResourceLimits {
	return ResourceLimits{
		MaxMemoryMB:           1024,
		MaxJobMemoryMB:        1536,
		MaxCPUPercent:         75,
		MaxProcesses:          32,
		MaxConcurrentCompiles: 2,
		InstallTimeoutSeconds: 300,
		CompileTimeoutSeconds: 180,
		RunTimeoutSeconds:     60,
	}
}

func ResourceLimitsFromEnv() ResourceLimits {
	limits := DefaultResourceLimits()
	limits.MaxMemoryMB = envInt("SANDBOX_MAX_MEMORY_MB", limits.MaxMemoryMB)
	limits.MaxJobMemoryMB = envInt("SANDBOX_MAX_JOB_MEMORY_MB", limits.MaxJobMemoryMB)
	limits.MaxCPUPercent = envInt("SANDBOX_MAX_CPU_PERCENT", limits.MaxCPUPercent)
	limits.MaxProcesses = envInt("SANDBOX_MAX_PROCESSES", limits.MaxProcesses)
	limits.MaxConcurrentCompiles = envInt("SANDBOX_MAX_CONCURRENT_COMPILES", limits.MaxConcurrentCompiles)
	limits.InstallTimeoutSeconds = envInt("SANDBOX_INSTALL_TIMEOUT", limits.InstallTimeoutSeconds)
	limits.CompileTimeoutSeconds = envInt("SANDBOX_COMPILE_TIMEOUT", limits.CompileTimeoutSeconds)
	limits.RunTimeoutSeconds = envInt("SANDBOX_RUN_TIMEOUT", limits.RunTimeoutSeconds)
	return limits
}

func (l ResourceLimits) applyEnv() {
	heapMB := l.MaxMemoryMB
	if heapMB <= 0 {
		heapMB = 1024
	}

	javaOpts := fmt.Sprintf(
		"-Xmx%dm -Xms256m -XX:MaxMetaspaceSize=256m -XX:+UseSerialGC -XX:ActiveProcessorCount=2",
		heapMB,
	)
	mavenOpts := fmt.Sprintf("-Xmx%dm -Xms256m", heapMB)

	setEnvIfEmpty("JAVA_TOOL_OPTIONS", javaOpts)
	setEnvIfEmpty("_JAVA_OPTIONS", javaOpts)
	setEnvIfEmpty("MAVEN_OPTS", mavenOpts)
	setEnvIfEmpty("MAVEN_ARGS", "-B -ntp -Dmaven.artifact.threads=1")
}

func setEnvIfEmpty(key, value string) {
	if os.Getenv(key) == "" {
		_ = os.Setenv(key, value)
	}
}

func envInt(key string, fallback int) int {
	raw := os.Getenv(key)
	if raw == "" {
		return fallback
	}
	value, err := strconv.Atoi(raw)
	if err != nil || value <= 0 {
		return fallback
	}
	return value
}
