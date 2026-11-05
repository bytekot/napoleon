import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  creationDate: text('creation_date').notNull(),
  dueDate: text('due_date'),
  order: integer('order'),
  completed: integer('completed', { mode: 'boolean' }).default(false),
})
