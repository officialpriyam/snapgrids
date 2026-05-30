import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import pg from "pg"

const { Pool } = pg

export const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")

function parseEnvLine(line) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) {
    return null
  }

  const separatorIndex = trimmed.indexOf("=")
  if (separatorIndex === -1) {
    return null
  }

  const key = trimmed.slice(0, separatorIndex).trim()
  let value = trimmed.slice(separatorIndex + 1).trim()

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1)
  }

  return { key, value }
}

export function loadEnv() {
  for (const fileName of [".env.local", ".env"]) {
    const envPath = path.join(rootDir, fileName)
    if (!fs.existsSync(envPath)) {
      continue
    }

    const content = fs.readFileSync(envPath, "utf8")
    for (const line of content.split(/\r?\n/)) {
      const parsed = parseEnvLine(line)
      if (parsed && process.env[parsed.key] === undefined) {
        process.env[parsed.key] = parsed.value
      }
    }
  }
}

export function getDatabaseUrl() {
  loadEnv()
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL or POSTGRES_URL is required.")
  }
  validateDatabaseUrl(connectionString)
  return connectionString
}

function validateDatabaseUrl(connectionString) {
  let url
  try {
    url = new URL(connectionString)
  } catch {
    throw new Error("DATABASE_URL/POSTGRES_URL must be a valid PostgreSQL URL.")
  }

  const password = decodeURIComponent(url.password || "")
  if (!password) {
    throw new Error("DATABASE_URL/POSTGRES_URL must include the PostgreSQL password.")
  }

  if (/[<>]/.test(password) || /redacted|changeme|replace|password|your-password/i.test(password)) {
    throw new Error("DATABASE_URL/POSTGRES_URL password is still a placeholder. Paste the real PostgreSQL password.")
  }
}

export function getSslConfig(connectionString) {
  try {
    const url = new URL(connectionString)
    const sslMode = url.searchParams.get("sslmode")
    if (process.env.POSTGRES_SSL === "true" || sslMode || url.hostname.endsWith(".aivencloud.com")) {
      return { rejectUnauthorized: false }
    }
  } catch {
    if (process.env.POSTGRES_SSL === "true" || /[?&]sslmode=/i.test(connectionString)) {
      return { rejectUnauthorized: false }
    }
  }

  return undefined
}

export function getConnectionConfig() {
  const rawConnectionString = getDatabaseUrl()
  const ssl = getSslConfig(rawConnectionString)

  if (!ssl) {
    return { connectionString: rawConnectionString, ssl }
  }

  try {
    const url = new URL(rawConnectionString)
    url.searchParams.delete("sslmode")
    url.searchParams.delete("sslcert")
    url.searchParams.delete("sslkey")
    url.searchParams.delete("sslrootcert")
    return { connectionString: url.toString(), ssl }
  } catch {
    return { connectionString: rawConnectionString, ssl }
  }
}

export async function withPool(callback) {
  const { connectionString, ssl } = getConnectionConfig()
  const pool = new Pool({
    connectionString,
    ssl,
  })

  try {
    return await callback(pool)
  } finally {
    await pool.end()
  }
}
