import { describe, it, expect } from 'vitest'
import { batchEditSchema, batchDeleteSchema, createTaskSchema } from '../task.schema.js'

describe('createTaskSchema', () => {
  it('принимает валидные данные', () => {
    const result = createTaskSchema.safeParse({
      name: 'New Task',
      creationDate: '2024-06-15',
    })

    expect(result.success).toBe(true)
  })

  it('отклоняет пустое имя', () => {
    const result = createTaskSchema.safeParse({
      name: '',
      creationDate: '2024-06-15',
    })

    expect(result.success).toBe(false)
  })

  it('отклоняет отсутствие creationDate', () => {
    const result = createTaskSchema.safeParse({
      name: 'Task',
    })

    expect(result.success).toBe(false)
  })

  it('отклоняет отсутствие name', () => {
    const result = createTaskSchema.safeParse({
      creationDate: '2024-06-15',
    })

    expect(result.success).toBe(false)
  })
})

describe('batchEditSchema', () => {
  it('принимает задачу с одним полем для обновления', () => {
    const result = batchEditSchema.safeParse([{ id: 'abc', completed: true }])

    expect(result.success).toBe(true)
  })

  it('принимает null для dueDate и order (очистка значения)', () => {
    const result = batchEditSchema.safeParse([{ id: 'abc', dueDate: null, order: null }])

    expect(result.success).toBe(true)
  })

  it('принимает несколько задач в одном батче', () => {
    const result = batchEditSchema.safeParse([
      { id: 'a', order: 1 },
      { id: 'b', name: 'new name' },
    ])

    expect(result.success).toBe(true)
  })

  it('отклоняет задачу без полей для обновления (только id)', () => {
    const result = batchEditSchema.safeParse([{ id: 'abc' }])

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'At least one field to update is required',
      )
    }
  })

  it('отклоняет батч, если хотя бы одна задача без полей для обновления', () => {
    const result = batchEditSchema.safeParse([{ id: 'a', completed: true }, { id: 'b' }])

    expect(result.success).toBe(false)
  })

  it('отклоняет пустой массив', () => {
    const result = batchEditSchema.safeParse([])

    expect(result.success).toBe(false)
  })

  it('отклоняет пустое имя', () => {
    const result = batchEditSchema.safeParse([{ id: 'abc', name: '' }])

    expect(result.success).toBe(false)
  })
})

describe('batchDeleteSchema', () => {
  it('принимает массив непустых строк', () => {
    const result = batchDeleteSchema.safeParse(['id1', 'id2'])

    expect(result.success).toBe(true)
  })

  it('отклоняет пустой массив', () => {
    const result = batchDeleteSchema.safeParse([])

    expect(result.success).toBe(false)
  })

  it('отклоняет пустую строку в массиве', () => {
    const result = batchDeleteSchema.safeParse(['id1', ''])

    expect(result.success).toBe(false)
  })

  it('отклоняет не-массив', () => {
    const result = batchDeleteSchema.safeParse({ ids: ['id1'] })

    expect(result.success).toBe(false)
  })
})
