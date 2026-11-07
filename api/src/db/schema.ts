import { sqliteTable, text, integer, index, check } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  creationDate: text('creation_date').notNull(),
  dueDate: text('due_date'),
  order: integer('order'),
  completed: integer('completed', { mode: 'boolean' }).default(false),
}, (table) => ({
  dueDateOrderIdx: index('due_date_order_idx').on(table.dueDate, table.order),
  // Инвариант: docs/task-reordering.md
  orderIntegrityCheck: check('order_integrity_check', sql`${table.dueDate} IS NULL OR ${table.order} IS NOT NULL`),
}))
