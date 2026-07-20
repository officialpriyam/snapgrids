package compiler

import (
	"os"
	"path/filepath"
	"strings"
)

// FindArtifact searches common build directory outputs for compiler artifacts
func FindArtifact(rootPath string) string {
	searchDirs := []string{"target", "build/libs", "dist", "bin", "out"}
	for _, dir := range searchDirs {
		fullDir := filepath.Join(rootPath, dir)
		if _, err := os.Stat(fullDir); err == nil {
			var found string
			_ = filepath.Walk(fullDir, func(path string, info os.FileInfo, err error) error {
				if err != nil {
					return nil
				}
				if info.IsDir() {
					return nil
				}
				ext := strings.ToLower(filepath.Ext(path))
				if ext == ".jar" || ext == ".zip" || ext == ".war" || ext == ".ear" {
					rel, err := filepath.Rel(rootPath, path)
					if err == nil {
						found = strings.ReplaceAll(rel, "\\", "/")
						// Return a signal to stop walking
						return filepath.SkipAll
					}
				}
				return nil
			})
			// Walk returns SkipAll as an error, so we ignore it if we found the file
			if found != "" {
				return found
			}
		}
	}
	return ""
}
