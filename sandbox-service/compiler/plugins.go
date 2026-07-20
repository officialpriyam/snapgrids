package compiler

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

// LanguagePlugin represents a loadable language plugin configuration
type LanguagePlugin struct {
	ID                   string            `json:"id"`
	Name                 string            `json:"name"`
	FileExtension        string            `json:"fileExtension"`
	DefaultFileStructure []string          `json:"defaultFileStructure"`
	CompilerCommands     CompilerCommands  `json:"compilerCommands"`
	SystemPrompt         string            `json:"systemPrompt"`
	Languages            []SubLanguage     `json:"languages,omitempty"`
}

// CompilerCommands holds the commands for each build stage
type CompilerCommands struct {
	Install string `json:"install,omitempty"`
	Compile string `json:"compile"`
	Run     string `json:"run"`
}

// SubLanguage represents a sub-language within a plugin (e.g., Discord bot has JS, TS, Python, Ruby)
type SubLanguage struct {
	ID               string           `json:"id"`
	Name             string           `json:"name"`
	FileExtension    string           `json:"file_extension"`
	CompilerCommands *CompilerCommands `json:"compilerCommands,omitempty"`
}

// PluginManager manages loaded language plugins
type PluginManager struct {
	plugins map[string]*LanguagePlugin
}

// NewPluginManager creates a new plugin manager and loads plugins from the given directory
func NewPluginManager(pluginsDir string) *PluginManager {
	pm := &PluginManager{
		plugins: make(map[string]*LanguagePlugin),
	}
	pm.loadPlugins(pluginsDir)
	return pm
}

func (pm *PluginManager) loadPlugins(pluginsDir string) {
	if pluginsDir == "" {
		fmt.Println("[PluginManager] No plugins directory configured")
		return
	}

	entries, err := os.ReadDir(pluginsDir)
	if err != nil {
		fmt.Printf("[PluginManager] Warning: cannot read plugins dir %s: %v\n", pluginsDir, err)
		return
	}

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		configPath := filepath.Join(pluginsDir, entry.Name(), "plugin.json")
		data, err := os.ReadFile(configPath)
		if err != nil {
			continue // No plugin.json, skip
		}

		var plugin LanguagePlugin
		if err := json.Unmarshal(data, &plugin); err != nil {
			fmt.Printf("[PluginManager] Failed to parse %s: %v\n", configPath, err)
			continue
		}

		pm.plugins[plugin.ID] = &plugin
		fmt.Printf("[PluginManager] Loaded plugin: %s (%s)\n", plugin.Name, plugin.ID)
	}
}

// GetPlugin returns a plugin by ID, checking sub-languages if needed
func (pm *PluginManager) GetPlugin(id string) *LanguagePlugin {
	// Direct match
	if p, ok := pm.plugins[id]; ok {
		return p
	}

	// Check sub-languages within plugins
	for _, p := range pm.plugins {
		for _, lang := range p.Languages {
			if lang.ID == id {
				cmds := p.CompilerCommands
				if lang.CompilerCommands != nil {
					cmds = *lang.CompilerCommands
				}
				return &LanguagePlugin{
					ID:               lang.ID,
					Name:             lang.Name,
					FileExtension:    lang.FileExtension,
					CompilerCommands: cmds,
					SystemPrompt:     p.SystemPrompt,
				}
			}
		}
	}

	return nil
}

// GetAllPlugins returns all loaded plugins
func (pm *PluginManager) GetAllPlugins() []*LanguagePlugin {
	var result []*LanguagePlugin
	for _, p := range pm.plugins {
		result = append(result, p)
	}
	return result
}
