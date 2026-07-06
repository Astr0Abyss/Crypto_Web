import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { Pool } from "pg";

const root = resolve(".");
const envPath = join(root, ".env");

if (existsSync(envPath)) {
  readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .forEach((line) => {
      const [key, ...valueParts] = line.split("=");
      if (!process.env[key]) {
        process.env[key] = valueParts.join("=").replace(/^['"]|['"]$/g, "");
      }
    });
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
});

await pool.query("SELECT 1");
await pool.query(`
  CREATE TABLE IF NOT EXISTS guest_users (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS app_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS auth_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS generations (
    id TEXT PRIMARY KEY,
    guest_id TEXT REFERENCES guest_users(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES app_users(id) ON DELETE CASCADE,
    algorithm TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('encrypt', 'decrypt')),
    input_text TEXT NOT NULL,
    output_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  ALTER TABLE generations
    ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES app_users(id) ON DELETE CASCADE;

  ALTER TABLE generations
    ALTER COLUMN guest_id DROP NOT NULL;

  CREATE INDEX IF NOT EXISTS generations_guest_created_idx
    ON generations (guest_id, created_at DESC);

  CREATE INDEX IF NOT EXISTS generations_user_created_idx
    ON generations (user_id, created_at DESC);
`);

await pool.end();
console.log("Neon connection and schema are ready.");
