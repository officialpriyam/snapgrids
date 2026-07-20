# Velix AI Sandbox Service

Go service that provides isolated compilation sandboxes for Java/Kotlin projects.

## Tech Stack
- **Language**: Go
- **Communication**: HTTP + WebSocket
- **Compilation**: javac, Gradle, Maven

## Getting Started

```bash
go build -o velix-sandbox.exe ./main.go
./velix-sandbox.exe
```

Service runs on `http://localhost:3002`.

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Listen port (default: 3002) |
| `API_KEY` | Shared secret for backend authentication |
| `SANDBOX_DIR` | Root directory for sandbox environments |
| `MAX_MEMORY_MB` | Memory limit per compilation |
| `TIMEOUT_SECONDS` | Compilation timeout |

## How It Works

1. Backend receives a compile request from the user
2. Backend forwards the request to the sandbox service with an API key
3. Sandbox creates an isolated temp directory with the project files
4. Sandbox runs the appropriate compiler (javac/gradle/maven)
5. Sandbox streams output back via WebSocket or returns the result
6. Sandbox cleans up the temp directory

## API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/compile` | Submit compilation job |
| GET | `/health` | Health check |
| WS | `/ws` | Real-time compilation output stream |

## Project Structure

```
main.go           # Entry point, HTTP server
handlers/         # Request handlers
compiler/         # Java/Kotlin compiler logic
sandbox/          # Sandbox isolation and cleanup
service/          # Service layer
config/           # Configuration
middleware/       # Auth, rate limiting
```
