import fs from "node:fs/promises"
import path from "node:path"
import { rootDir, withPool } from "./utils.mjs"

const migrationsDir = path.join(rootDir, "migrations")

async function ensureMigrationTable(pool) {
  await pool.query(`
    create table if not exists app_schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `)
}

await withPool(async (pool) => {
  await ensureMigrationTable(pool)

  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort((left, right) => left.localeCompare(right))

  for (const file of files) {
    const existing = await pool.query(
      "select 1 from app_schema_migrations where name = $1 limit 1",
      [file]
    )

    if (existing.rowCount) {
      console.log(`skip ${file}`)
      continue
    }

    const sql = await fs.readFile(path.join(migrationsDir, file), "utf8")
    const client = await pool.connect()

    try {
      await client.query("begin")
      await client.query(sql)
      await client.query("insert into app_schema_migrations (name) values ($1)", [file])
      await client.query("commit")
      console.log(`applied ${file}`)
    } catch (error) {
      await client.query("rollback")
      throw error
    } finally {
      client.release()
    }
  }
})
