# Velix AI — BuiltByBit Resource Description

## Short Description (for listing title/subtitle)

AI-Powered Minecraft Code Generation Platform — Generate plugins, configs, datapacks & more with AI. Full IDE, version history, team collaboration.

---

## Full Description

### What is Velix AI?

Velix AI is a self-hosted SaaS platform that uses AI to generate production-ready Minecraft server code. Describe what you want in plain English, and Velix generates the code — complete with an IDE, version history, dependency management, and project sharing.

### What Can It Generate?

**Minecraft Plugins (Java & Kotlin)**
- EssentialsX, WorldGuard, LuckPerms, WorldEdit, Vault, Citizens, CoreProtect, HolographicDisplays, Multiverse-Core, Velocity, Paper, Purpur, and any Spigot/Bukkit plugin
- Full compilation to .jar files via built-in sandbox compiler

**Server Configuration Files**
- YAML/JSON configs for 13+ popular plugins
- Ready-to-drop-in configs with proper formatting

**Datapacks**
- Complete datapacks with pack.mcmeta, functions, advancements, loot tables, world generation, tags, and predicates
- 6 generation modes: full, functions-only, advancements, loot tables, worldgen, tags

**Scripting**
- Command block sequences, macros, scheduled tasks
- mcfunction files with proper syntax

### Key Features

- **Built-in IDE** — Full code editor with file tree, syntax highlighting, and live preview
- **AI Chat** — Conversational code generation with automatic prompt enhancement
- **File Uploads** — Drag & drop images, code files, and text directly into chat
- **Version History** — Automatic snapshots with restore capability
- **Dependency Management** — Browse and add SpigotMC dependencies
- **Project Sharing** — Public showcase + private share links with token-based access
- **AI Thumbnails** — Auto-generated project preview images
- **Team Collaboration** — Invite team members with role-based access (owner/editor/viewer)
- **Dark & Light Theme** — Full theme support
- **Multi-Platform** — Minecraft, Hytale, Chrome Extensions, Discord Bots, and more
- **Multiple AI Models** — NVIDIA NIM + OpenRouter models including Claude, GPT, and open-source options
- **Credit System** — Built-in credit management with transaction history

### Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Discord, Google, GitHub OAuth)
- **Cache:** Upstash Redis
- **AI:** NVIDIA NIM API, OpenRouter, Google Gemini
- **Compiler:** Custom Go sandbox service

### Self-Hosted

This is a complete, self-hosted solution. You own your data, your users, and your platform. No monthly fees to us — just your own infrastructure costs.

### Who Is This For?

- Minecraft server network owners who want to offer code generation to their community
- Developers who want a branded AI coding platform
- Hosting companies looking to add AI tools to their control panel
- Anyone who wants to run their own AI-powered code generation SaaS

### What You Get

- Full source code (frontend + backend)
- Database schema and migrations
- Installation guide
- Discord support

### Requirements

- Node.js 18+
- Supabase project (free tier works)
- NVIDIA NIM API key (free tier available)
- Vercel account (free tier works for frontend)
- Linux VPS for backend + compiler (4GB RAM minimum)

---

## Tags

`minecraft`, `ai`, `code-generation`, `plugin`, `datapack`, `saas`, `self-hosted`, `nextjs`, `nodejs`, `spigot`, `paper`, `bukkit`

---

## Version History

**1.0.0** — Initial release
- AI plugin generation (Java/Kotlin)
- Configuration file generation
- Datapack generation
- Scripting generation
- Built-in IDE
- Version history
- Dependency management
- Public & private project sharing
- AI-generated thumbnails
- Team collaboration
- Dark/light theme
- Multi-platform support
