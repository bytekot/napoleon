import { sql } from 'drizzle-orm'
import { db } from '../db/connection.js'

db.run(sql`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    creation_date TEXT NOT NULL,
    due_date TEXT,
    "order" INTEGER,
    completed INTEGER DEFAULT 0,
    CONSTRAINT order_integrity_check CHECK(due_date IS NULL OR "order" IS NOT NULL)
  )
`)

db.run(sql`
  CREATE INDEX IF NOT EXISTS due_date_order_idx ON tasks (due_date, "order")
`)

export const testDb = db
