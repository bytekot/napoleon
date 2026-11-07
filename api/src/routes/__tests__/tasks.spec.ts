import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { sql } from 'drizzle-orm'
import { ZodError } from 'zod'
import { testDb } from '../../test/setup.js'
import { tasks } from '../../db/schema.js'
import taskRoutes from '../tasks.js'

const app = new Hono()

app.route('/api', taskRoutes)

app.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json(
      { error: 'Validation failed', details: err.issues },
      400,
    )
  }

  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

beforeEach(() => {
  testDb.run(sql`DELETE FROM tasks`)
})

describe('GET /api/tasks', () => {
  it('возвращает пустой массив при отсутствии задач', async () => {
    const res = await app.request('/api/tasks')
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual([])
  })

  it('возвращает созданные задачи', async () => {
    testDb.insert(tasks).values({
      id: 't1',
      name: 'Task 1',
      creationDate: '2024-01-01',
      dueDate: null,
      order: null,
      completed: false,
    }).run()

    const res = await app.request('/api/tasks')
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveLength(1)
    expect(body[0].id).toBe('t1')
    expect(body[0].name).toBe('Task 1')
  })
})

describe('POST /api/task', () => {
  it('создаёт задачу с валидными данными и возвращает 201', async () => {
    const res = await app.request('/api/task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Task', creationDate: '2024-06-15' }),
    })
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.name).toBe('New Task')
    expect(body.creationDate).toBe('2024-06-15')
    expect(body.dueDate).toBeNull()
    expect(body.order).toBeNull()
    expect(body.completed).toBe(false)
    expect(body.id).toBeDefined()
    expect(typeof body.id).toBe('string')
  })

  it('отклоняет запрос с пустым name (400)', async () => {
    const res = await app.request('/api/task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', creationDate: '2024-06-15' }),
    })

    expect(res.status).toBe(400)
  })

  it('отклоняет запрос без creationDate (400)', async () => {
    const res = await app.request('/api/task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Task' }),
    })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/tasks/edit', () => {
  beforeEach(() => {
    testDb.insert(tasks).values([
      { id: 'a', name: 'A', creationDate: '2024-01-01', dueDate: '2024-06-01', order: 0, completed: false },
      { id: 'b', name: 'B', creationDate: '2024-01-01', dueDate: '2024-06-01', order: 1, completed: false },
      { id: 'c', name: 'C', creationDate: '2024-01-01', dueDate: '2024-06-01', order: 2, completed: false },
    ]).run()
  })

  it('обновляет одно поле у одной задачи', async () => {
    const res = await app.request('/api/tasks/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks: [{ id: 'a', completed: true }] }),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveLength(1)
    expect(body[0].id).toBe('a')
    expect(body[0].completed).toBe(true)
  })

  it('обновляет несколько задач в одном батче', async () => {
    const res = await app.request('/api/tasks/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tasks: [
          { id: 'a', name: 'Updated A' },
          { id: 'b', order: 5 },
        ],
      }),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveLength(2)
  })

  it('очищает dueDate и order через null', async () => {
    const res = await app.request('/api/tasks/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks: [{ id: 'a', dueDate: null, order: null }] }),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body[0].dueDate).toBeNull()
    expect(body[0].order).toBeNull()
  })

  it('пропускает несуществующий id и возвращает только обновлённые', async () => {
    const res = await app.request('/api/tasks/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tasks: [
          { id: 'nonexistent', completed: true },
          { id: 'a', completed: true },
        ],
      }),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveLength(1)
    expect(body[0].id).toBe('a')
  })

  it('отклоняет батч с задачей без полей для обновления (400)', async () => {
    const res = await app.request('/api/tasks/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks: [{ id: 'a' }] }),
    })

    expect(res.status).toBe(400)
  })

  it('отклоняет пустой массив tasks (400)', async () => {
    const res = await app.request('/api/tasks/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks: [] }),
    })

    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/task/:id', () => {
  beforeEach(() => {
    testDb.insert(tasks).values({
      id: 'existing',
      name: 'To Delete',
      creationDate: '2024-01-01',
      dueDate: null,
      order: null,
      completed: false,
    }).run()
  })

  it('удаляет существующую задачу и возвращает её id', async () => {
    const res = await app.request('/api/task/existing', { method: 'DELETE' })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toBe('existing')

    const remaining = testDb.select().from(tasks).all()

    expect(remaining).toHaveLength(0)
  })

  it('возвращает 404 для несуществующей задачи', async () => {
    const res = await app.request('/api/task/nonexistent', { method: 'DELETE' })
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.error).toBe('Task not found')
  })

  it('возвращает 404 для пустого id', async () => {
    const res = await app.request('/api/task/nonexistent', { method: 'DELETE' })

    expect(res.status).toBe(404)
  })
})