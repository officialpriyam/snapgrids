//go:build !windows

package compiler

import (
	"fmt"
	"os/exec"
	"syscall"
)

func applyProcessLimits(cmd *exec.Cmd, limits ResourceLimits) (func(), error) {
	if cmd.SysProcAttr == nil {
		cmd.SysProcAttr = &syscall.SysProcAttr{}
	}
	cmd.SysProcAttr.Setpgid = true

	if limits.MaxMemoryMB > 0 {
		maxBytes := uint64(limits.MaxMemoryMB) * 1024 * 1024
		_ = syscall.Setrlimit(syscall.RLIMIT_AS, &syscall.Rlimit{
			Cur: maxBytes,
			Max: maxBytes,
		})
	}

	if err := cmd.Start(); err != nil {
		return nil, err
	}

	cleanup := func() {
		if cmd.Process != nil {
			_ = syscall.Kill(-cmd.Process.Pid, syscall.SIGKILL)
		}
	}
	return cleanup, nil
}
