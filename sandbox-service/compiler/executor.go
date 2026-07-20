package compiler

import (
	"bytes"
	"context"
	"fmt"
	"os/exec"
	"runtime"
	"time"
)

type StageResult struct {
	Success  bool   `json:"success"`
	Stdout   string `json:"stdout"`
	Stderr   string `json:"stderr"`
	Duration int64  `json:"duration"` // milliseconds
}

type CompilationStages struct {
	DependencyInstall *StageResult `json:"dependencyInstall,omitempty"`
	Compilation       *StageResult `json:"compilation,omitempty"`
	Execution         *StageResult `json:"execution,omitempty"`
}

type CompilationResult struct {
	Success bool               `json:"success"`
	Log     string             `json:"log"`
	Stages  *CompilationStages `json:"stages"`
}

type Stage string

const (
	StageInstall Stage = "install"
	StageCompile Stage = "compile"
	StageRun     Stage = "run"
)

type Executor struct {
	limits ResourceLimits
	pool   chan struct{}
}

func NewExecutor(limits ResourceLimits) *Executor {
	if limits.MaxConcurrentCompiles <= 0 {
		limits.MaxConcurrentCompiles = 2
	}
	return &Executor{
		limits: limits,
		pool:   make(chan struct{}, limits.MaxConcurrentCompiles),
	}
}

func (e *Executor) Limits() ResourceLimits {
	return e.limits
}

func (e *Executor) Execute(ctx context.Context, commandStr, cwd string, stage Stage) (*StageResult, error) {
	timeout := e.timeoutFor(stage)

	select {
	case e.pool <- struct{}{}:
		defer func() { <-e.pool }()
	case <-ctx.Done():
		return nil, ctx.Err()
	}

	return executeCommand(ctx, commandStr, cwd, timeout, e.limits)
}

func (e *Executor) timeoutFor(stage Stage) time.Duration {
	switch stage {
	case StageInstall:
		return time.Duration(e.limits.InstallTimeoutSeconds) * time.Second
	case StageCompile:
		return time.Duration(e.limits.CompileTimeoutSeconds) * time.Second
	case StageRun:
		return time.Duration(e.limits.RunTimeoutSeconds) * time.Second
	default:
		return 120 * time.Second
	}
}

func executeCommand(ctx context.Context, commandStr, cwd string, timeout time.Duration, limits ResourceLimits) (*StageResult, error) {
	startTime := time.Now()
	limits.applyEnv()

	execCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		cmd = exec.CommandContext(execCtx, "cmd.exe", "/c", commandStr)
	} else {
		cmd = exec.CommandContext(execCtx, "sh", "-c", commandStr)
	}
	cmd.Dir = cwd

	var stdoutBuf, stderrBuf bytes.Buffer
	cmd.Stdout = &stdoutBuf
	cmd.Stderr = &stderrBuf

	cleanup, err := applyProcessLimits(cmd, limits)
	if err != nil {
		return nil, err
	}
	if cleanup != nil {
		defer cleanup()
	}

	waitErr := cmd.Wait()
	duration := time.Since(startTime).Milliseconds()

	success := waitErr == nil
	stderrStr := stderrBuf.String()
	if waitErr != nil && stderrStr == "" {
		stderrStr = waitErr.Error()
	}

	return &StageResult{
		Success:  success,
		Stdout:   stdoutBuf.String(),
		Stderr:   stderrStr,
		Duration: duration,
	}, nil
}

func FormatStageOutput(stageName string, stage *StageResult) string {
	if stage == nil {
		return ""
	}
	status := "FAILED"
	if stage.Success {
		status = "SUCCESS"
	}
	return fmt.Sprintf("=== %s ===\nStatus: %s\n%s\n%s\n", stageName, status, stage.Stdout, stage.Stderr)
}

func FormatAllStages(stages *CompilationStages) string {
	output := ""
	if stages.DependencyInstall != nil {
		output += FormatStageOutput("Install", stages.DependencyInstall)
	}
	if stages.Compilation != nil {
		output += FormatStageOutput("Compile", stages.Compilation)
	}
	if stages.Execution != nil {
		output += FormatStageOutput("Run", stages.Execution)
	}
	return output
}
