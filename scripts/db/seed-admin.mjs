import crypto from "node:crypto"
import { withPool } from "./utils.mjs"

const ADMIN_EMAIL = "admin@snapgrids.store"
const DEFAULT_PASSWORD_HASH =
  "pbkdf2_sha256:310000:D8A_-xyp9KTSX4Qwks5gIA:IbORGTZTEqI_0JxWKjxSuWazkFE1EN6mgmL0sBP6bog"

function defaultAdminConfig() {
  return {
    version: 2,
    adminEmail: ADMIN_EMAIL,
    passwordHash: DEFAULT_PASSWORD_HASH,
    passwordChangedAt: new Date().toISOString(),
    sessionSecret: crypto.randomBytes(32).toString("base64url"),
    paymenter: {
      billingUrl: "",
    },
    mappings: {
      homepage: {},
      pages: {},
      games: {},
    },
  }
}

await withPool(async (pool) => {
  const config = defaultAdminConfig()
  const result = await pool.query(
    `
      insert into app_admin_settings (key, value)
      values ($1, $2::jsonb)
      on conflict (key) do nothing
    `,
    ["admin", JSON.stringify(config)]
  )

  if (result.rowCount) {
    console.log("seeded admin settings")
  } else {
    console.log("admin settings already exist; seed skipped")
  }
})
