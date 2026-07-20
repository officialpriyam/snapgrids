# Velix AI — Installation Guide

Velix AI is an AI-powered code generation platform for Minecraft plugins, server configs, datapacks, and more. This guide walks you through deploying the full stack.

---

## Prerequisites

- **Node.js** 18+ and npm
- **Supabase** project (free tier works)
- **Redis** via Upstash (free tier works)
- **NVIDIA NIM API key** (for AI models)
- **OpenRouter API key** (optional, for additional models)
- **Vercel** account (for frontend deployment)
- A **Linux VPS** or similar for the backend + sandbox compiler

---

## 1. Supabase Setup

### Create the Database

Go to your Supabase project → **SQL Editor** and run these migrations in order:

```
backend/supabase/001_initial_schema.sql
backend/supabase/002_version_history_and_deps.sql
backend/supabase/003_wiki_pages.sql
backend/supabase/004_modelgen_history.sql
backend/supabase/005_gitbook_connections.sql
backend/supabase/006_team_members.sql
backend/supabase/007_project_thumbnails.sql
backend/supabase/008_share_token.sql
```

### Enable OAuth Providers

Go to **Authentication → Providers** and enable:
- **Discord** (recommended for Minecraft community)
- **Google** (optional)
- **GitHub** (optional)

For each provider, you'll need to create an OAuth app and paste the Client ID + Secret into Supabase.

### Get Your Keys

From **Settings → API**:
- `SUPABASE_URL` — your project URL
- `SUPABASE_ANON_KEY` — public anon key
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (keep secret)

---

## 2. Backend Setup

### Clone & Install

```bash
git clone https://github.com/officialpriyam/velix-backend.git
cd velix-backend
npm install
```

### Configure Environment

Copy `.env.example` to `.env` and fill in:

```env
PORT=3006

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Providers
NVIDIA_API_KEY=nvapi-xxx        # Required — get from build.nvidia.com
OPENROUTER_API_KEY=sk-or-xxx    # Optional — get from openrouter.ai
GEMINI_API_KEY=xxx              # Optional — for image generation

# OAuth
OAUTH_REDIRECT_URL=https://your-domain.com/

# Compiler Sandbox
SANDBOX_SERVICE_URL=https://your-compiler.yourdomain.com
SANDBOX_API_KEY=your-sandbox-key

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Security
CORS_ORIGINS=https://your-domain.com,http://localhost:3000
ADMIN_EMAILS=admin@yourdomain.com
SESSION_COOKIE_MAX_AGE_MS=604800000
```

### Start the Backend

```bash
npm run dev     # Development (ts-node)
npm run build   # Production build
npm start       # Production
```

The backend runs on port **3006** by default.

---

## 3. Frontend Setup

### Clone & Install

```bash
git clone https://github.com/officialpriyam/velix-frontend.git
cd velix-frontend
npm install
```

### Configure Environment

Create `.env`:

```env
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
BACKEND_URL=http://localhost:3006
NEXT_PUBLIC_BACKEND_URL=http://localhost:3006
NEXT_PUBLIC_OAUTH_REDIRECT_URL=https://your-domain.com/
```

### Start Development

```bash
npm run dev
```

Frontend runs on port **3000**.

---

## 4. Compiler Sandbox (Optional)

The sandbox compiles Java/Kotlin plugins. It's a separate Go service.

```bash
git clone https://github.com/officialpriyam/velix-compiler.git
cd velix-compiler
# Follow the compiler README for setup
```

Set `SANDBOX_SERVICE_URL` and `SANDBOX_API_KEY` in your backend `.env`.

---

## 5. Deploy to Production

### Backend (VPS)

1. Build the backend: `npm run build`
2. Use PM2 or systemd to keep it running:
   ```bash
   pm2 start dist/server.js --name velix-api
   ```
3. Put behind Nginx/Caddy with SSL

### Frontend (Vercel)

1. Push to GitHub
2. Import the repo in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy — Vercel handles everything automatically

### Custom Domain

1. Point your domain to Vercel (frontend) and your VPS (backend)
2. Update `CORS_ORIGINS` in backend `.env`
3. Update `OAUTH_REDIRECT_URL` in backend `.env`
4. Update `NEXT_PUBLIC_OAUTH_REDIRECT_URL` in frontend `.env`
5. Update Discord/Google OAuth redirect URIs in their respective dashboards

---

## 6. Database Migrations

When updating, run new migration files from `backend/supabase/` in order:

```sql
-- Run in Supabase SQL Editor
ALTER TABLE projects ADD COLUMN IF NOT EXISTS thumbnail TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;
```

---

## 7. Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NVIDIA_API_KEY` | Yes | NVIDIA NIM API key for AI models |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `OPENROUTER_API_KEY` | No | OpenRouter API key for extra models |
| `GEMINI_API_KEY` | No | Google Gemini for image generation |
| `SANDBOX_SERVICE_URL` | No | Compiler sandbox URL |
| `SANDBOX_API_KEY` | No | Compiler sandbox API key |
| `UPSTASH_REDIS_REST_URL` | Yes | Upstash Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash Redis token |
| `OAUTH_REDIRECT_URL` | Yes | OAuth callback URL |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins |

---

## Features

- AI-powered Minecraft plugin generation (Java, Kotlin)
- Configuration file generation (EssentialsX, WorldGuard, LuckPerms, etc.)
- Datapack generation (functions, advancements, loot tables, worldgen)
- Scripting generation (command blocks, macros, scheduled tasks)
- Built-in IDE with file editor
- Version history & snapshots
- Dependency management
- Project sharing (public + private links)
- AI-generated project thumbnails
- Team collaboration
- Image generation (NVIDIA + Gemini + Pollinations)
- Dark/light theme

---

## Support

- Discord: https://discord.gg/FD6QrzeATb
- GitHub Issues: https://github.com/officialpriyam/velix-backend/issues
