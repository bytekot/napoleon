import { describe, it, expect } from 'vitest'
import { batchEditSchema } from '../task.schema.js'

describe('batchEditSchema', () => {
  it('принимает задачу с одним полем для обновления', () => {
    const result = batchEditSchema.safeParse({
      tasks: [{ id: 'abc', completed: true }],
    })

    expect(result.success).toBe(true)
  })

  it('принимает null для dueDate и order (очистка значения)', () => {
    const result = batchEditSchema.safeParse({
      tasks: [{ id: 'abc', dueDate: null, order: null }],
    })

    expect(result.success).toBe(true)
  })

  it('принимает несколько задач в одном батче', () => {
    const result = batchEditSchema.safeParse({
      tasks: [
        { id: 'a', order: 1 },
        { id: 'b', name: 'new name' },
      ],
    })

    expect(result.success).toBe(true)
  })

  it('отклоняет задачу без полей для обновления (только id)', () => {
    const result = batchEditSchema.safeParse({
      tasks: [{ id: 'abc' }],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'At least one field to update is required',
      )
    }
  })

  it('отклоняет батч, если хотя бы одна задача без полей для обновления', () => {
    const result = batchEditSchema.safeParse({
      tasks: [{ id: 'a', completed: true }, { id: 'b' }],
    })

    expect(result.success).toBe(false)
  })

  it('отклоняет пустой массив tasks', () => {
    const result = batchEditSchema.safeParse({ tasks: [] })

    expect(result.success).toBe(false)
  })

  it('отклоняет пустое имя', () => {
    const result = batchEditSchema.safeParse({
      tasks: [{ id: 'abc', name: '' }],
    })

    expect(result.success).toBe(false)
  })
})
