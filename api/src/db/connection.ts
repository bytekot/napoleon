import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema.js'

const dbPath = process.env.DATABASE_URL ?? './api/data/napoleon.db'

let sqlite: Database.Database

if (dbPath === ':memory:') {
  sqlite = new Database(':memory:')
} else {
  sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
}

sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })
