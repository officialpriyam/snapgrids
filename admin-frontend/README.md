# Velix AI Admin Frontend

Next.js admin panel for managing the Velix AI platform.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

```bash
npm install
npm run dev
```

Admin panel runs on `http://localhost:3010`.

## Environment Variables

| Variable | Description |
|---|---|
| `BACKEND_URL` | Backend API base URL (default: `http://localhost:3006/api`) |
| `ADMIN_API_KEY` | Shared secret for backend admin API authentication |
| `ADMIN_IP_WHITELIST` | Comma-separated IPs allowed to access admin panel |
| `NEXT_PUBLIC_MAIN_APP_URL` | Link back to the main user app |

## Authentication

Admin panel uses IP whitelisting + API key:
1. Request must come from a whitelisted IP
2. `X-Admin-Api-Key` header is sent with all backend requests
3. Must match `ADMIN_API_KEY` in backend `.env`

## Features

- **User Management**: View, search, and delete user accounts
- **Platform Monitoring**: View active projects, sessions, and system health
- **Credit Management**: Monitor credit usage and transactions

## Project Structure

```
src/
  app/              # Next.js pages
    page.tsx        # Admin dashboard
  components/       # Admin-specific components
  lib/              # API helpers, auth
```
