package config

import "kodari/sandbox-service/compiler"

func (c *CompilerConfig) ResourceLimits() compiler.ResourceLimits {
	return compiler.ResourceLimits{
		MaxMemoryMB:           c.MaxMemoryMB,
		MaxJobMemoryMB:        c.MaxJobMemoryMB,
		MaxCPUPercent:         c.MaxCPUPercent,
		MaxProcesses:          c.MaxProcesses,
		MaxConcurrentCompiles: c.MaxConcurrentCompiles,
		InstallTimeoutSeconds: c.InstallTimeoutSeconds,
		CompileTimeoutSeconds: c.CompileTimeoutSeconds,
		RunTimeoutSeconds:     c.RunTimeoutSeconds,
	}
}
