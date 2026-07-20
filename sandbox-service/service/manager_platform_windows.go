//go:build windows

package service

import "syscall"

func configureBackgroundProcess(attr *syscall.SysProcAttr) {
	attr.HideWindow = true
	attr.CreationFlags = syscall.CREATE_NEW_PROCESS_GROUP | 0x00000008
}

const serverBinaryName = "sandbox-service.exe"
