import { Hono } from 'hono'
import { eq, and, gte, gt, lte, lt } from 'drizzle-orm'
import { db } from '../db/connection.js'
import { tasks } from '../db/schema.js'
import { createTaskSchema, editTaskSchema, taskIdParamSchema } from '../schemas/task.schema.js'
import { nanoid } from 'nanoid'

const taskRoutes = new Hono()

taskRoutes.get('/tasks', async (c) => {
  const allTasks = await db.select().from(tasks)
  return c.json(allTasks)
})

taskRoutes.post('/task', async (c) => {
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

// TODO: revisit reorder logic — consider simplifying to single-update with client-side orchestration
taskRoutes.patch('/task/:id', async (c) => {
  const rawId = c.req.param('id')
  const paramResult = taskIdParamSchema.safeParse({ id: rawId })
  if (!paramResult.success) {
    return c.json({ error: 'Invalid task id' }, 400)
  }

  const body = await c.req.json()
  const data = editTaskSchema.parse(body)
  const taskId = paramResult.data.id

  const currentTask = await db.select().from(tasks).where(eq(tasks.id, taskId)).get()
  if (!currentTask) {
    return c.json({ error: 'Task not found' }, 404)
  }

  const hasOrderChange = typeof data.order === 'number' && data.dueDate !== undefined
  const isReorderWithDateChange = hasOrderChange && data.dueDate !== null

  if (isReorderWithDateChange) {
    const oldDueDate = currentTask.dueDate
    const oldOrder = currentTask.order
    const newDueDate = data.dueDate
    const newOrder = data.order!

    const dateChanged = oldDueDate !== newDueDate

    if (dateChanged) {
      const updatedTasks: typeof currentTask[] = []

      const allTasks = await db.select().from(tasks)

      for (const task of allTasks) {
        if (task.id === taskId) {
          const updated = { ...task, ...data }
          await db.update(tasks).set(data).where(eq(tasks.id, taskId))
          updatedTasks.push(updated as typeof currentTask)
        } else if (task.dueDate === newDueDate && task.order !== null && task.order >= newOrder) {
          const newTaskOrder = task.order + 1
          await db.update(tasks).set({ order: newTaskOrder }).where(eq(tasks.id, task.id))
          updatedTasks.push({ ...task, order: newTaskOrder })
        } else if (task.dueDate === oldDueDate && task.order !== null && oldOrder !== null && task.order > oldOrder) {
          const newTaskOrder = task.order - 1
          await db.update(tasks).set({ order: newTaskOrder }).where(eq(tasks.id, task.id))
          updatedTasks.push({ ...task, order: newTaskOrder })
        }
      }

      return c.json(updatedTasks)
    } else {
      const sameDateTasks = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.dueDate, newDueDate)))

      const updatedTasks: typeof currentTask[] = []

      if (oldOrder !== null && oldOrder < newOrder) {
        for (const task of sameDateTasks) {
          if (task.id === taskId) {
            const updated = { ...task, ...data }
            await db.update(tasks).set(data).where(eq(tasks.id, taskId))
            updatedTasks.push(updated as typeof currentTask)
          } else if (task.order !== null && task.order > oldOrder && task.order <= newOrder) {
            const newTaskOrder = task.order - 1
            await db.update(tasks).set({ order: newTaskOrder }).where(eq(tasks.id, task.id))
            updatedTasks.push({ ...task, order: newTaskOrder })
          }
        }
      } else if (oldOrder !== null && oldOrder > newOrder) {
        for (const task of sameDateTasks) {
          if (task.id === taskId) {
            const updated = { ...task, ...data }
            await db.update(tasks).set(data).where(eq(tasks.id, taskId))
            updatedTasks.push(updated as typeof currentTask)
          } else if (task.order !== null && task.order < oldOrder && task.order >= newOrder) {
            const newTaskOrder = task.order + 1
            await db.update(tasks).set({ order: newTaskOrder }).where(eq(tasks.id, task.id))
            updatedTasks.push({ ...task, order: newTaskOrder })
          }
        }
      } else {
        await db.update(tasks).set(data).where(eq(tasks.id, taskId))
        const updated = await db.select().from(tasks).where(eq(tasks.id, taskId)).get()
        if (updated) updatedTasks.push(updated)
      }

      return c.json(updatedTasks)
    }
  }

  await db.update(tasks).set(data).where(eq(tasks.id, taskId))
  const updated = await db.select().from(tasks).where(eq(tasks.id, taskId)).get()

  return c.json(updated)
})

taskRoutes.delete('/task/:id', async (c) => {
  const rawId = c.req.param('id')
  const paramResult = taskIdParamSchema.safeParse({ id: rawId })
  if (!paramResult.success) {
    return c.json({ error: 'Invalid task id' }, 400)
  }

  const taskId = paramResult.data.id
  const existing = await db.select().from(tasks).where(eq(tasks.id, taskId)).get()
  if (!existing) {
    return c.json({ error: 'Task not found' }, 404)
  }

  await db.delete(tasks).where(eq(tasks.id, taskId))

  return c.json(taskId)
})

export default taskRoutes
