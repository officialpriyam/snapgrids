//go:build !windows

package service

import "syscall"

func configureBackgroundProcess(attr *syscall.SysProcAttr) {
	attr.Setpgid = true
}

const serverBinaryName = "sandbox-service"
