package service

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"
)

const (
	stateDirName = ".velix-sandbox"
	pidFileName  = "sandbox.pid"
	logFileName  = "sandbox.log"
)

type Manager struct {
	Root string
}

func NewManager() (*Manager, error) {
	root, err := findServiceRoot()
	if err != nil {
		return nil, err
	}
	return &Manager{Root: root}, nil
}

func (m *Manager) Start() error {
	if pid, running := m.runningPID(); running {
		return fmt.Errorf("sandbox service already running (pid %d)", pid)
	}

	if err := m.ensureBuilt(); err != nil {
		return err
	}

	if err := os.MkdirAll(m.stateDir(), 0o755); err != nil {
		return fmt.Errorf("create state dir: %w", err)
	}

	logFile, err := os.OpenFile(m.logPath(), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o644)
	if err != nil {
		return fmt.Errorf("open log file: %w", err)
	}
	defer logFile.Close()

	serverPath := filepath.Join(m.Root, serverBinaryName)
	cmd := exec.Command(serverPath)
	cmd.Dir = m.Root
	cmd.Stdout = logFile
	cmd.Stderr = logFile
	cmd.SysProcAttr = &syscall.SysProcAttr{}
	configureBackgroundProcess(cmd.SysProcAttr)

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("start sandbox service: %w", err)
	}

	pid := cmd.Process.Pid
	if err := os.WriteFile(m.pidPath(), []byte(strconv.Itoa(pid)), 0o644); err != nil {
		_ = cmd.Process.Kill()
		return fmt.Errorf("write pid file: %w", err)
	}

	_ = cmd.Process.Release()
	fmt.Printf("Started velix sandbox service (pid %d)\n", pid)
	fmt.Printf("Logs: %s\n", m.logPath())
	return nil
}

func (m *Manager) Stop() error {
	pid, running := m.runningPID()
	if !running {
		_ = os.Remove(m.pidPath())
		return fmt.Errorf("sandbox service is not running")
	}

	proc, err := os.FindProcess(pid)
	if err != nil {
		return fmt.Errorf("find process %d: %w", pid, err)
	}

	if err := proc.Kill(); err != nil {
		return fmt.Errorf("stop process %d: %w", pid, err)
	}

	_ = os.Remove(m.pidPath())
	fmt.Printf("Stopped velix sandbox service (pid %d)\n", pid)
	return nil
}

func (m *Manager) Restart() error {
	if _, running := m.runningPID(); running {
		if err := m.Stop(); err != nil {
			return err
		}
		time.Sleep(500 * time.Millisecond)
	}
	return m.Start()
}

func (m *Manager) LiveLogs() error {
	logPath := m.logPath()
	if _, err := os.Stat(logPath); err != nil {
		return fmt.Errorf("log file not found: %s", logPath)
	}

	file, err := os.Open(logPath)
	if err != nil {
		return fmt.Errorf("open log file: %w", err)
	}
	defer file.Close()

	reader := bufio.NewReader(file)
	for {
		line, err := reader.ReadString('\n')
		if len(line) > 0 {
			fmt.Print(line)
		}
		if err != nil {
			if err == io.EOF {
				time.Sleep(500 * time.Millisecond)
				continue
			}
			return err
		}
	}
}

func (m *Manager) runningPID() (int, bool) {
	data, err := os.ReadFile(m.pidPath())
	if err != nil {
		return 0, false
	}

	pid, err := strconv.Atoi(strings.TrimSpace(string(data)))
	if err != nil || pid <= 0 {
		return 0, false
	}

	if !processAlive(pid) {
		return 0, false
	}

	return pid, true
}

func (m *Manager) ensureBuilt() error {
	serverPath := filepath.Join(m.Root, serverBinaryName)
	if _, err := os.Stat(serverPath); err == nil {
		return nil
	}

	goBin := "go"
	if _, err := exec.LookPath("go"); err != nil {
		goBin = `C:\Program Files\Go\bin\go.exe`
	}

	fmt.Printf("Building %s...\n", serverBinaryName)
	build := exec.Command(goBin, "build", "-o", serverBinaryName, ".")
	build.Dir = m.Root
	build.Stdout = os.Stdout
	build.Stderr = os.Stderr
	if err := build.Run(); err != nil {
		return fmt.Errorf("build sandbox service: %w", err)
	}

	if _, err := os.Stat(serverPath); err != nil {
		return fmt.Errorf("sandbox binary missing after build: %s", serverPath)
	}
	return nil
}

func (m *Manager) stateDir() string {
	return filepath.Join(m.Root, stateDirName)
}

func (m *Manager) pidPath() string {
	return filepath.Join(m.stateDir(), pidFileName)
}

func (m *Manager) logPath() string {
	return filepath.Join(m.stateDir(), logFileName)
}

func findServiceRoot() (string, error) {
	candidates := []string{}

	if cwd, err := os.Getwd(); err == nil {
		candidates = append(candidates, cwd)
	}

	if exe, err := os.Executable(); err == nil {
		dir := filepath.Dir(exe)
		candidates = append(candidates, dir, filepath.Dir(dir))
	}

	seen := map[string]struct{}{}
	for _, candidate := range candidates {
		candidate = filepath.Clean(candidate)
		if _, ok := seen[candidate]; ok {
			continue
		}
		seen[candidate] = struct{}{}

		if isServiceRoot(candidate) {
			return candidate, nil
		}
	}

	return "", fmt.Errorf("could not locate sandbox-service root (run from sandbox-service directory)")
}

func isServiceRoot(dir string) bool {
	if _, err := os.Stat(filepath.Join(dir, "go.mod")); err == nil {
		return true
	}
	if _, err := os.Stat(filepath.Join(dir, ".env")); err == nil {
		return true
	}
	if _, err := os.Stat(filepath.Join(dir, "main.go")); err == nil {
		return true
	}
	return false
}
