package main

import (
	"fmt"
	"os"

	"kodari/sandbox-service/service"
)

func main() {
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	manager, err := service.NewManager()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}

	switch os.Args[1] {
	case "start":
		if err := manager.Start(); err != nil {
			fmt.Fprintf(os.Stderr, "Error: %v\n", err)
			os.Exit(1)
		}
	case "stop":
		if err := manager.Stop(); err != nil {
			fmt.Fprintf(os.Stderr, "Error: %v\n", err)
			os.Exit(1)
		}
	case "restart":
		if err := manager.Restart(); err != nil {
			fmt.Fprintf(os.Stderr, "Error: %v\n", err)
			os.Exit(1)
		}
	case "live-logs":
		if err := manager.LiveLogs(); err != nil {
			fmt.Fprintf(os.Stderr, "Error: %v\n", err)
			os.Exit(1)
		}
	default:
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Println("Velix Sandbox Service Manager")
	fmt.Println()
	fmt.Println("Usage:")
	fmt.Println("  velix-sandbox start")
	fmt.Println("  velix-sandbox stop")
	fmt.Println("  velix-sandbox restart")
	fmt.Println("  velix-sandbox live-logs")
}
