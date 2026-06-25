import "server-only"

import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { Pool } from "pg"
import type { AdminMappings } from "@/app/types/paymenter"
import type { SiteContent } from "@/app/types/site"
import { sanitizeSiteContent, syncMappingsFromSite } from "@/app/lib/site-content"

export const ADMIN_EMAIL = "admin@snapgrids.store"

const CONFIG_KEY = "admin"
const DEFAULT_PASSWORD_HASH =
  "pbkdf2_sha256:310000:D8A_-xyp9KTSX4Qwks5gIA:IbORGTZTEqI_0JxWKjxSuWazkFE1EN6mgmL0sBP6bog"

const globalForPg = globalThis as typeof globalThis & {
  __snapgridsAdminPool?: Pool
  __snapgridsAdminConnectionKey?: string
  __snapgridsAdminDbReady?: Promise<void>
}

export interface AdminConfig {
  version: 2
  adminEmail: string
  passwordHash: string
  passwordChangedAt: string
  sessionSecret: string
  paymenter: {
    billingUrl: string
    apiKeyEncrypted?: string
    apiKeyIv?: string
    apiKeyTag?: string
  }
  mappings: AdminMappings
  site: SiteContent
}

export interface SanitizedAdminSettings {
  adminEmail: string
  paymenter: {
    billingUrl: string
    hasApiKey: boolean
    encryptedApiKey: boolean
  }
  mappings: AdminMappings
  site: SiteContent
}

const defaultMappings: AdminMappings = {
  homepage: {
    gameServers: "",
    vpsHosting: "",
    dedicatedServers: "",
    webHosting: "",
    discord: "",
  },
  pages: {
    webhosting: "",
    vps: "",
    dedicated: "",
    discord: "",
  },
  games: {},
}

function cloneMappings(mappings?: Partial<AdminMappings>): AdminMappings {
  return {
    homepage: { ...defaultMappings.homepage, ...(mappings?.homepage ?? {}) },
    pages: { ...defaultMappings.pages, ...(mappings?.pages ?? {}) },
    games: { ...(mappings?.games ?? {}) },
  }
}

export function sanitizeMappings(mappings?: Partial<AdminMappings>): AdminMappings {
  const normalized = cloneMappings(mappings)

  const cleanRecord = (record: Record<string, string>) =>
    Object.fromEntries(
      Object.entries(record).map(([key, value]) => [key, typeof value === "string" ? value.trim() : ""])
    )

  return {
    homepage: cleanRecord(normalized.homepage),
    pages: cleanRecord(normalized.pages),
    games: cleanRecord(normalized.games),
  }
}

function defaultConfig(): AdminConfig {
  const mappings = cloneMappings()
  const site = sanitizeSiteContent(undefined, mappings)

  return {
    version: 2,
    adminEmail: ADMIN_EMAIL,
    passwordHash: DEFAULT_PASSWORD_HASH,
    passwordChangedAt: new Date().toISOString(),
    sessionSecret: crypto.randomBytes(32).toString("base64url"),
    paymenter: {
      billingUrl: "",
    },
    mappings: syncMappingsFromSite(mappings, site),
    site,
  }
}

function normalizeConfig(config: Partial<AdminConfig>): AdminConfig {
  const mappings = sanitizeMappings(config.mappings)
  const site = sanitizeSiteContent(config.site, mappings)
  const paymenter = normalizePaymenterConfig(config.paymenter)

  return {
    ...defaultConfig(),
    ...config,
    version: 2,
    adminEmail: ADMIN_EMAIL,
    paymenter,
    mappings: syncMappingsFromSite(mappings, site),
    site,
  }
}

function parseEnvValue(raw: string) {
  let value = raw.trim()
  const quote = value[0]

  if (quote === `"` || quote === "'") {
    const end = value.indexOf(quote, 1)
    if (end > 0) {
      return value.slice(1, end).trim()
    }
  }

  return value.replace(/\s+#.*$/, "").trim()
}

function readLocalEnvValue(name: string) {
  const matcher = new RegExp(`^(?:export\\s+)?${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*=`)

  for (const fileName of [".env.local", ".env"]) {
    try {
      const file = path.join(process.cwd(), fileName)
      const content = fs.readFileSync(file, "utf8")

      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith("#") || !matcher.test(trimmed)) {
          continue
        }

        return parseEnvValue(trimmed.replace(matcher, ""))
      }
    } catch {
      // Local env files are optional in deployed environments.
    }
  }

  return ""
}

function envValue(name: string) {
  return (process.env[name] || readLocalEnvValue(name)).trim()
}

function envCandidates(name: string) {
  const candidates: string[] = []

  for (const value of [process.env[name], readLocalEnvValue(name)]) {
    const trimmed = value?.trim()
    if (trimmed && !candidates.includes(trimmed)) {
      candidates.push(trimmed)
    }
  }

  return candidates
}

function postgresUrl() {
  const value = envValue("DATABASE_URL") || envValue("POSTGRES_URL")
  if (value) {
    validateDatabaseUrl(value)
  }
  return value
}

function validateDatabaseUrl(connectionString: string) {
  let url: URL
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

function getPool() {
  const rawConnectionString = postgresUrl()
  if (!rawConnectionString) {
    throw new Error("DATABASE_URL or POSTGRES_URL is required. Admin settings are stored in PostgreSQL only.")
  }

  const { connectionString, ssl } = databaseConnectionConfig(rawConnectionString)
  const connectionKey = JSON.stringify({ connectionString, ssl: Boolean(ssl) })

  if (!globalForPg.__snapgridsAdminPool || globalForPg.__snapgridsAdminConnectionKey !== connectionKey) {
    void globalForPg.__snapgridsAdminPool?.end().catch(() => undefined)
    globalForPg.__snapgridsAdminPool = new Pool({
      connectionString,
      ssl,
      connectionTimeoutMillis: 10000,
    })
    globalForPg.__snapgridsAdminConnectionKey = connectionKey
    globalForPg.__snapgridsAdminDbReady = undefined
  }

  return globalForPg.__snapgridsAdminPool
}

function databaseConnectionConfig(connectionString: string) {
  try {
    const url = new URL(connectionString)
    const sslMode = url.searchParams.get("sslmode")?.toLowerCase()
    const sslRequested =
      envValue("POSTGRES_SSL") === "true" ||
      Boolean(sslMode) ||
      url.hostname.endsWith(".aivencloud.com")

    if (!sslRequested) {
      return { connectionString, ssl: undefined }
    }

    url.searchParams.delete("sslmode")
    url.searchParams.delete("sslcert")
    url.searchParams.delete("sslkey")
    url.searchParams.delete("sslrootcert")

    return {
      connectionString: url.toString(),
      ssl: { rejectUnauthorized: false },
    }
  } catch {
    const sslRequested = envValue("POSTGRES_SSL") === "true" || /[?&]sslmode=/i.test(connectionString)
    return {
      connectionString,
      ssl: sslRequested ? { rejectUnauthorized: false } : undefined,
    }
  }
}

async function ensureAdminConfigTable(pool: Pool) {
  globalForPg.__snapgridsAdminDbReady ??= pool.query(`
    create table if not exists app_admin_settings (
      key text primary key,
      value jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `).then(() => undefined)

  try {
    await globalForPg.__snapgridsAdminDbReady
  } catch (error) {
    globalForPg.__snapgridsAdminDbReady = undefined
    throw error
  }
}

async function readAdminConfigFromDatabase(pool: Pool): Promise<AdminConfig | null> {
  await ensureAdminConfigTable(pool)
  const result = await pool.query<{ value: Partial<AdminConfig> }>(
    "select value from app_admin_settings where key = $1 limit 1",
    [CONFIG_KEY]
  )

  if (result.rowCount === 0) {
    return null
  }

  return normalizeConfig(result.rows[0].value)
}

async function writeAdminConfigToDatabase(pool: Pool, config: AdminConfig) {
  await ensureAdminConfigTable(pool)
  const normalized = normalizeConfig(config)
  await pool.query(
    `
      insert into app_admin_settings (key, value, updated_at)
      values ($1, $2::jsonb, now())
      on conflict (key)
      do update set value = excluded.value, updated_at = now()
    `,
    [CONFIG_KEY, JSON.stringify(normalized)]
  )
}

export async function readAdminConfig(): Promise<AdminConfig> {
  const pool = getPool()

  try {
    const databaseConfig = await readAdminConfigFromDatabase(pool)
    if (databaseConfig) {
      return databaseConfig
    }

    const config = defaultConfig()
    await writeAdminConfigToDatabase(pool, config)
    return config
  } catch (error) {
    throw new Error(
      `Unable to read admin config from PostgreSQL: ${error instanceof Error ? error.message : "unknown error"}`
    )
  }
}

export async function writeAdminConfig(config: AdminConfig) {
  const pool = getPool()
  await writeAdminConfigToDatabase(pool, config)
}

function encryptionKey(): Buffer | null {
  const secret = [
    ...envCandidates("ADMIN_ENCRYPTION_KEY"),
    ...envCandidates("ADMIN_SESSION_SECRET"),
    ...envCandidates("NEXTAUTH_SECRET"),
  ].find((value) => value.length >= 16)

  if (!secret) {
    return null
  }

  return crypto.createHash("sha256").update(secret).digest()
}

function encryptPaymenterApiKey(apiKey: string) {
  const key = encryptionKey()
  if (!key) {
    throw new Error("ADMIN_ENCRYPTION_KEY must be set to at least 16 characters before saving Paymenter API keys.")
  }

  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  const encrypted = Buffer.concat([cipher.update(apiKey, "utf8"), cipher.final()])

  return {
    apiKeyEncrypted: encrypted.toString("base64url"),
    apiKeyIv: iv.toString("base64url"),
    apiKeyTag: cipher.getAuthTag().toString("base64url"),
  }
}

function normalizePaymenterConfig(paymenter?: Partial<AdminConfig["paymenter"]> & { apiKeyPlaintext?: string }) {
  const normalized: AdminConfig["paymenter"] = {
    billingUrl: paymenter?.billingUrl ?? "",
  }

  if (paymenter?.apiKeyEncrypted && paymenter.apiKeyIv && paymenter.apiKeyTag) {
    normalized.apiKeyEncrypted = paymenter.apiKeyEncrypted
    normalized.apiKeyIv = paymenter.apiKeyIv
    normalized.apiKeyTag = paymenter.apiKeyTag
  } else if (paymenter?.apiKeyPlaintext && encryptionKey()) {
    Object.assign(normalized, encryptPaymenterApiKey(paymenter.apiKeyPlaintext))
  }

  return normalized
}

export function setPaymenterApiKey(config: AdminConfig, apiKey: string) {
  delete (config.paymenter as AdminConfig["paymenter"] & { apiKeyPlaintext?: string }).apiKeyPlaintext
  delete config.paymenter.apiKeyEncrypted
  delete config.paymenter.apiKeyIv
  delete config.paymenter.apiKeyTag

  if (!apiKey) {
    return
  }

  Object.assign(config.paymenter, encryptPaymenterApiKey(apiKey))
}

export function getPaymenterApiKey(config: AdminConfig): string {
  const key = encryptionKey()
  if (
    !key ||
    !config.paymenter.apiKeyEncrypted ||
    !config.paymenter.apiKeyIv ||
    !config.paymenter.apiKeyTag
  ) {
    return ""
  }

  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(config.paymenter.apiKeyIv, "base64url")
    )
    decipher.setAuthTag(Buffer.from(config.paymenter.apiKeyTag, "base64url"))
    return Buffer.concat([
      decipher.update(Buffer.from(config.paymenter.apiKeyEncrypted, "base64url")),
      decipher.final(),
    ]).toString("utf8")
  } catch {
    return ""
  }
}

export function sanitizeAdminSettings(config: AdminConfig): SanitizedAdminSettings {
  return {
    adminEmail: ADMIN_EMAIL,
    paymenter: {
      billingUrl: config.paymenter.billingUrl,
      hasApiKey: Boolean(getPaymenterApiKey(config)),
      encryptedApiKey: Boolean(config.paymenter.apiKeyEncrypted),
    },
    mappings: cloneMappings(config.mappings),
    site: config.site,
  }
}

export function normalizeBillingUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "")
  if (!trimmed) {
    return ""
  }

  const url = new URL(trimmed)
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Billing URL must use http or https.")
  }

  return url.toString().replace(/\/+$/, "")
}

export function resolveMappedCategory(config: AdminConfig, surface: string | null, key: string | null) {
  if (!surface || !key) {
    return ""
  }

  if (surface === "homepage") {
    return config.mappings.homepage[key] ?? ""
  }

  if (surface === "page") {
    return config.site.services.find((service) => service.slug === key || service.id === key)?.categoryId || config.mappings.pages[key] || ""
  }

  if (surface === "game") {
    return config.site.games.find((game) => game.slug === key || game.id === key)?.categoryId || config.mappings.games[key] || ""
  }

  return ""
}
