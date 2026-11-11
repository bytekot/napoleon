import { describe, it, expect } from 'vitest'
import { diffOrders, buildReorderUpdates, type DropEventResult } from '../task'
import type { Task } from '../../types/tasks'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: '1',
    name: 'Test',
    creationDate: '2026-11-01',
    dueDate: null,
    order: null,
    completed: false,
    ...overrides,
  }
}

function makeDropEvent(overrides: Partial<DropEventResult> = {}): DropEventResult {
  return {
    keys: ['task-1'],
    from: { list: '2026-11-01' },
    to: { list: '2026-11-01' },
    result: new Map(),
    ...overrides,
  }
}

describe('diffOrders', () => {
  it('возвращает пустой массив для списка с корректной нумерацией', () => {
    const tasks: Task[] = [
      makeTask({ id: 'a', order: 0 }),
      makeTask({ id: 'b', order: 1 }),
      makeTask({ id: 'c', order: 2 }),
    ]

    expect(diffOrders(tasks)).toEqual([])
  })

  it('возвращает updates для задач с изменённым order', () => {
    const tasks: Task[] = [makeTask({ id: 'a', order: 1 }), makeTask({ id: 'b', order: 0 })]

    const result = diffOrders(tasks)

    expect(result).toContainEqual({ id: 'a', order: 0 })
    expect(result).toContainEqual({ id: 'b', order: 1 })
    expect(result).toHaveLength(2)
  })

  it('возвращает только изменённые задачи', () => {
    const tasks: Task[] = [
      makeTask({ id: 'a', order: 0 }),
      makeTask({ id: 'b', order: 2 }),
      makeTask({ id: 'c', order: 1 }),
    ]

    const result = diffOrders(tasks)

    expect(result.find((u) => u.id === 'a')).toBeUndefined()
    expect(result).toContainEqual({ id: 'b', order: 1 })
    expect(result).toContainEqual({ id: 'c', order: 2 })
    expect(result).toHaveLength(2)
  })

  it('обрабатывает пустой список', () => {
    expect(diffOrders([])).toEqual([])
  })

  it('обрабатывает список из одной задачи с order=0', () => {
    const tasks: Task[] = [makeTask({ id: 'a', order: 0 })]

    expect(diffOrders(tasks)).toEqual([])
  })

  it('обрабатывает список из одной задачи с order!=0', () => {
    const tasks: Task[] = [makeTask({ id: 'a', order: 5 })]

    expect(diffOrders(tasks)).toEqual([{ id: 'a', order: 0 }])
  })

  it('обрабатывает задачи с order=null как требующие обновления', () => {
    const tasks: Task[] = [makeTask({ id: 'a', order: null }), makeTask({ id: 'b', order: 1 })]

    const result = diffOrders(tasks)

    expect(result).toContainEqual({ id: 'a', order: 0 })
    expect(result.find((u) => u.id === 'b')).toBeUndefined()
    expect(result).toHaveLength(1)
  })

  it('не включает dueDate в updates (только order)', () => {
    const tasks: Task[] = [
      makeTask({ id: 'a', dueDate: '2026-11-01', order: 1 }),
      makeTask({ id: 'b', dueDate: '2026-11-01', order: 0 }),
    ]

    const result = diffOrders(tasks)

    for (const update of result) {
      expect(update.dueDate).toBeUndefined()
    }
  })
})

describe('buildReorderUpdates', () => {
  it('same-day reorder: возвращает только изменения order без dueDate', () => {
    const a = makeTask({ id: 'a', dueDate: '2026-11-01', order: 0 })
    const b = makeTask({ id: 'b', dueDate: '2026-11-01', order: 1 })

    const e = makeDropEvent({
      keys: ['a'],
      from: { list: '2026-11-01' },
      to: { list: '2026-11-01' },
      result: new Map([['2026-11-01', [b, a]]]),
    })

    const updates = buildReorderUpdates(e, '2026-11-01')

    expect(updates).toContainEqual({ id: 'a', order: 1 })
    expect(updates).toContainEqual({ id: 'b', order: 0 })
    expect(updates.every((u) => u.dueDate === undefined)).toBe(true)
  })

  it('same-day no-op: пустой массив когда порядок не изменился', () => {
    const a = makeTask({ id: 'a', dueDate: '2026-11-01', order: 0 })
    const b = makeTask({ id: 'b', dueDate: '2026-11-01', order: 1 })

    const e = makeDropEvent({
      keys: ['a'],
      from: { list: '2026-11-01' },
      to: { list: '2026-11-01' },
      result: new Map([['2026-11-01', [a, b]]]),
    })

    expect(buildReorderUpdates(e, '2026-11-01')).toEqual([])
  })

  it('cross-day: добавляет dueDate к перемещённой задаче', () => {
    const a = makeTask({ id: 'a', dueDate: '2026-11-01', order: 0 })
    const b = makeTask({ id: 'b', dueDate: '2026-11-02', order: 0 })

    const e = makeDropEvent({
      keys: ['a'],
      from: { list: '2026-11-01' },
      to: { list: '2026-11-02' },
      result: new Map([
        ['2026-11-01', []],
        ['2026-11-02', [a, b]],
      ]),
    })

    const updates = buildReorderUpdates(e, '2026-11-02')

    expect(updates).toContainEqual({ id: 'a', order: 0, dueDate: '2026-11-02' })
    expect(updates).toContainEqual({ id: 'b', order: 1 })
  })

  it('cross-day в unplanned: order=null, dueDate=null', () => {
    const a = makeTask({ id: 'a', dueDate: '2026-11-01', order: 0 })

    const e = makeDropEvent({
      keys: ['a'],
      from: { list: '2026-11-01' },
      to: { list: 'unplanned' },
      result: new Map([
        ['2026-11-01', []],
        ['unplanned', [{ ...a, dueDate: null, order: null }]],
      ]),
    })

    const updates = buildReorderUpdates(e, null)

    expect(updates).toContainEqual({ id: 'a', order: null, dueDate: null })
  })

  it('пропускает unplanned-список при diffOrders', () => {
    const u = makeTask({ id: 'u', dueDate: null, order: null })

    const e = makeDropEvent({
      keys: ['u'],
      from: { list: 'unplanned' },
      to: { list: '2026-11-01' },
      result: new Map([
        ['unplanned', [u]],
        ['2026-11-01', [makeTask({ id: 'x', dueDate: '2026-11-01', order: 0 })]],
      ]),
    })

    const updates = buildReorderUpdates(e, '2026-11-01')

    expect(updates.find((u) => u.id === 'u' && u.order !== null)).toBeUndefined()
  })

  it('cross-day: создаёт update если задача не изменила order', () => {
    const a = makeTask({ id: 'a', dueDate: '2026-11-01', order: 0 })
    const b = makeTask({ id: 'b', dueDate: '2026-11-02', order: 0 })

    const e = makeDropEvent({
      keys: ['a'],
      from: { list: '2026-11-01' },
      to: { list: '2026-11-02' },
      result: new Map([
        ['2026-11-01', []],
        ['2026-11-02', [a, b]],
      ]),
    })

    const updates = buildReorderUpdates(e, '2026-11-02')

    const movedUpdate = updates.find((u) => u.id === 'a')

    expect(movedUpdate).toBeDefined()
    expect(movedUpdate!.dueDate).toBe('2026-11-02')
    expect(movedUpdate!.order).toBe(0)
  })

  it('не мутирует входные updates', () => {
    const a = makeTask({ id: 'a', dueDate: '2026-11-01', order: 0 })
    const b = makeTask({ id: 'b', dueDate: '2026-11-02', order: 0 })

    const resultMap = new Map([
      ['2026-11-01', []],
      ['2026-11-02', [a, b]],
    ])

    const e = makeDropEvent({
      keys: ['a'],
      from: { list: '2026-11-01' },
      to: { list: '2026-11-02' },
      result: resultMap,
    })

    const first = buildReorderUpdates(e, '2026-11-02')
    const second = buildReorderUpdates(e, '2026-11-02')

    expect(first).toEqual(second)
  })
})
