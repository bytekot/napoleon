import { Hono } from 'hono'
import { eq, inArray } from 'drizzle-orm'
import { db } from '../db/connection.js'
import { tasks } from '../db/schema.js'
import { createTaskSchema, batchEditSchema, batchDeleteSchema } from '../schemas/task.schema.js'
import { nanoid } from 'nanoid'

const taskRoutes = new Hono()

taskRoutes.get('/tasks', async (c) => {
  const allTasks = await db.select().from(tasks)
  return c.json(allTasks)
})

taskRoutes.post('/tasks', async (c) => {
  const body = await c.req.json()
  const validated = createTaskSchema.parse(body)

  const id = nanoid()
  const newTask = {
    id,
    name: validated.name,
    creationDate: validated.creationDate,
    dueDate: null,
    order: null,
    completed: false,
  }

  await db.insert(tasks).values(newTask)

  return c.json(newTask, 201)
})

taskRoutes.patch('/tasks', async (c) => {
  const body = await c.req.json()
  const validated = batchEditSchema.parse(body)

  const updatedTasks = db.transaction((tx) => {
    const result: (typeof tasks.$inferSelect)[] = []

    for (const update of validated) {
      const rows = tx
        .update(tasks)
        .set({
          dueDate: update.dueDate,
          order: update.order,
          completed: update.completed,
          name: update.name,
        })
        .where(eq(tasks.id, update.id))
        .returning()
        .all()

      if (rows.length > 0) {
        result.push(rows[0])
      }
    }

    return result
  })

  return c.json(updatedTasks)
})

taskRoutes.delete('/tasks', async (c) => {
  const body = await c.req.json()
  const validated = batchDeleteSchema.parse(body)

  await db.delete(tasks).where(inArray(tasks.id, validated))

  return c.json(validated)
})

export default taskRoutes
