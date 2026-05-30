import crypto from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"
import { rootDir, loadEnv, withPool } from "./utils.mjs"

const adminSettingsPath = path.join(rootDir, "storage", "admin-settings.json")

function encryptionKey() {
  loadEnv()
  const secret =
    process.env.ADMIN_ENCRYPTION_KEY ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET

  if (!secret || secret.length < 16) {
    return null
  }

  return crypto.createHash("sha256").update(secret).digest()
}

function encryptApiKey(apiKey) {
  const key = encryptionKey()
  if (!key) {
    return null
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

function sanitizeConfig(config) {
  const paymenter = {
    billingUrl: config?.paymenter?.billingUrl || "",
  }

  if (
    config?.paymenter?.apiKeyEncrypted &&
    config?.paymenter?.apiKeyIv &&
    config?.paymenter?.apiKeyTag
  ) {
    paymenter.apiKeyEncrypted = config.paymenter.apiKeyEncrypted
    paymenter.apiKeyIv = config.paymenter.apiKeyIv
    paymenter.apiKeyTag = config.paymenter.apiKeyTag
  } else if (config?.paymenter?.apiKeyPlaintext) {
    const encrypted = encryptApiKey(config.paymenter.apiKeyPlaintext)
    if (encrypted) {
      Object.assign(paymenter, encrypted)
    } else {
      console.warn("Paymenter API key was plaintext in JSON and was not imported because ADMIN_ENCRYPTION_KEY is not set.")
    }
  }

  return {
    ...config,
    version: 2,
    paymenter,
  }
}

const raw = await fs.readFile(adminSettingsPath, "utf8").catch((error) => {
  if (error.code === "ENOENT") {
    console.log("storage/admin-settings.json not found; nothing to import")
    process.exit(0)
  }
  throw error
})

const config = sanitizeConfig(JSON.parse(raw))

await withPool(async (pool) => {
  await pool.query(
    `
      insert into app_admin_settings (key, value)
      values ($1, $2::jsonb)
      on conflict (key)
      do update set value = excluded.value
    `,
    ["admin", JSON.stringify(config)]
  )
})

console.log("imported storage/admin-settings.json into PostgreSQL")
