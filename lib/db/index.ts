import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

// Cache the pool on globalThis so dev hot-reload (and warm serverless
// invocations) reuse one pool instead of opening a new one every time.
const globalForDb = globalThis as unknown as { pool?: Pool }

export const pool =
  globalForDb.pool ?? new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool

export const db = drizzle(pool, { schema })
