//go:build windows

package compiler

import (
	"log"
	"os"
	"os/exec"
	"syscall"
)

func applyProcessLimits(cmd *exec.Cmd, limits ResourceLimits) (func(), error) {
	if os.Getenv("SANDBOX_DISABLE_JOB_LIMITS") != "false" {
		log.Printf("[Sandbox] Job limits DISABLED (SANDBOX_DISABLE_JOB_LIMITS != false). Running build without memory limits.")
		if cmd.SysProcAttr == nil {
			cmd.SysProcAttr = &syscall.SysProcAttr{}
		}
		cmd.SysProcAttr.CreationFlags = syscall.CREATE_NEW_PROCESS_GROUP
		if err := cmd.Start(); err != nil {
			return nil, err
		}
		return func() {}, nil
	}

	log.Printf("[Sandbox] Job limits ENABLED (SANDBOX_DISABLE_JOB_LIMITS=false)")
	if cmd.SysProcAttr == nil {
		cmd.SysProcAttr = &syscall.SysProcAttr{}
	}
	cmd.SysProcAttr.CreationFlags = syscall.CREATE_NEW_PROCESS_GROUP
	if err := cmd.Start(); err != nil {
		return nil, err
	}
	return func() {}, nil
}
