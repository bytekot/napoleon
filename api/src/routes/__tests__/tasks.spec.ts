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

describe('POST /api/tasks', () => {
  it('создаёт задачу с валидными данными и возвращает 201', async () => {
    const res = await app.request('/api/tasks', {
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
    const res = await app.request('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', creationDate: '2024-06-15' }),
    })

    expect(res.status).toBe(400)
  })

  it('отклоняет запрос без creationDate (400)', async () => {
    const res = await app.request('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Task' }),
    })

    expect(res.status).toBe(400)
  })
})

describe('PATCH /api/tasks', () => {
  beforeEach(() => {
    testDb.insert(tasks).values([
      { id: 'a', name: 'A', creationDate: '2024-01-01', dueDate: '2024-06-01', order: 0, completed: false },
      { id: 'b', name: 'B', creationDate: '2024-01-01', dueDate: '2024-06-01', order: 1, completed: false },
      { id: 'c', name: 'C', creationDate: '2024-01-01', dueDate: '2024-06-01', order: 2, completed: false },
    ]).run()
  })

  it('обновляет одно поле у одной задачи', async () => {
    const res = await app.request('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ id: 'a', completed: true }]),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveLength(1)
    expect(body[0].id).toBe('a')
    expect(body[0].completed).toBe(true)
  })

  it('обновляет несколько задач в одном батче', async () => {
    const res = await app.request('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([
        { id: 'a', name: 'Updated A' },
        { id: 'b', order: 5 },
      ]),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveLength(2)
  })

  it('очищает dueDate и order через null', async () => {
    const res = await app.request('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ id: 'a', dueDate: null, order: null }]),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body[0].dueDate).toBeNull()
    expect(body[0].order).toBeNull()
  })

  it('пропускает несуществующий id и возвращает только обновлённые', async () => {
    const res = await app.request('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([
        { id: 'nonexistent', completed: true },
        { id: 'a', completed: true },
      ]),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveLength(1)
    expect(body[0].id).toBe('a')
  })

  it('отклоняет элемент без полей для обновления (400)', async () => {
    const res = await app.request('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ id: 'a' }]),
    })

    expect(res.status).toBe(400)
  })

  it('отклоняет пустой массив (400)', async () => {
    const res = await app.request('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([]),
    })

    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/tasks', () => {
  beforeEach(() => {
    testDb.insert(tasks).values([
      { id: 't1', name: 'Task 1', creationDate: '2024-01-01', dueDate: null, order: null, completed: false },
      { id: 't2', name: 'Task 2', creationDate: '2024-01-01', dueDate: null, order: null, completed: false },
      { id: 't3', name: 'Task 3', creationDate: '2024-01-01', dueDate: null, order: null, completed: false },
    ]).run()
  })

  it('удаляет одну задачу и возвращает массив ID', async () => {
    const res = await app.request('/api/tasks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(['t1']),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual(['t1'])

    const remaining = testDb.select().from(tasks).all()

    expect(remaining).toHaveLength(2)
    expect(remaining.find((t) => t.id === 't1')).toBeUndefined()
  })

  it('удаляет несколько задач за раз', async () => {
    const res = await app.request('/api/tasks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(['t1', 't3']),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual(['t1', 't3'])

    const remaining = testDb.select().from(tasks).all()

    expect(remaining).toHaveLength(1)
    expect(remaining[0].id).toBe('t2')
  })

  it('не падает при удалении несуществующих ID', async () => {
    const res = await app.request('/api/tasks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(['nonexistent']),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual(['nonexistent'])
  })

  it('отклоняет пустой массив (400)', async () => {
    const res = await app.request('/api/tasks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([]),
    })

    expect(res.status).toBe(400)
  })
})

describe('CHECK-констрейнт order_integrity_check', () => {
  beforeEach(() => {
    testDb.insert(tasks).values([
      { id: 'a', name: 'A', creationDate: '2024-01-01', dueDate: '2024-06-01', order: 0, completed: false },
    ]).run()
  })

  it('отклоняет установку dueDate без order через прямой INSERT', () => {
    expect(() => {
      testDb.insert(tasks).values({
        id: 'bad',
        name: 'Bad',
        creationDate: '2024-01-01',
        dueDate: '2024-06-01',
        order: null,
        completed: false,
      }).run()
    }).toThrow()
  })

  it('отклоняет UPDATE устанавливающий dueDate без order', () => {
    expect(() => {
      testDb.update(tasks)
        .set({ dueDate: '2024-07-01', order: null })
        .where(sql`${tasks.id} = 'a'`)
        .run()
    }).toThrow()
  })

  it('разрешает задачу без dueDate и без order', () => {
    expect(() => {
      testDb.insert(tasks).values({
        id: 'ok',
        name: 'OK',
        creationDate: '2024-01-01',
        dueDate: null,
        order: null,
        completed: false,
      }).run()
    }).not.toThrow()
  })
})