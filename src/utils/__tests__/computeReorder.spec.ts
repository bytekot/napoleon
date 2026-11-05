import { describe, it, expect } from 'vitest'
import { computeReorder } from '../tasks'
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

describe('computeReorder', () => {
  describe('cross-date move (дата изменилась)', () => {
    it('таски на новой дате с order >= newOrder сдвигаются +1', () => {
      const tasks: Task[] = [
        makeTask({ id: 'moved', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'sibling', dueDate: '2026-11-02', order: 1 }),
        makeTask({ id: 'after', dueDate: '2026-11-02', order: 3 }),
      ]

      const result = computeReorder(tasks, 'moved', '2026-11-02', 1)

      expect(result).toContainEqual({ id: 'moved', dueDate: '2026-11-02', order: 1 })
      expect(result).toContainEqual({ id: 'sibling', order: 2 })
      expect(result).toContainEqual({ id: 'after', order: 4 })
    })

    it('таски на старой дате с order > oldOrder сдвигаются -1', () => {
      const tasks: Task[] = [
        makeTask({ id: 'moved', dueDate: '2026-11-01', order: 1 }),
        makeTask({ id: 'before', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'after', dueDate: '2026-11-01', order: 2 }),
      ]

      const result = computeReorder(tasks, 'moved', '2026-11-02', 0)

      expect(result).toContainEqual({ id: 'moved', dueDate: '2026-11-02', order: 0 })
      expect(result).toContainEqual({ id: 'after', order: 1 })
      expect(result.find((u) => u.id === 'before')).toBeUndefined()
    })

    it('сам таск получает новые dueDate и order', () => {
      const tasks: Task[] = [makeTask({ id: 'moved', dueDate: '2026-11-01', order: 0 })]

      const result = computeReorder(tasks, 'moved', '2026-11-05', 3)

      expect(result).toEqual([{ id: 'moved', dueDate: '2026-11-05', order: 3 }])
    })

    it('нет тасков на старой/новой дате кроме перемещаемого → только сам таск', () => {
      const tasks: Task[] = [
        makeTask({ id: 'moved', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'other', dueDate: '2026-11-03', order: 0 }),
      ]

      const result = computeReorder(tasks, 'moved', '2026-11-02', 0)

      expect(result).toEqual([{ id: 'moved', dueDate: '2026-11-02', order: 0 }])
    })
  })

  describe('same-date reorder (дата не изменилась)', () => {
    it('сдвиг вперёд (oldOrder < newOrder) → таски в (oldOrder, newOrder] сдвигаются -1', () => {
      const tasks: Task[] = [
        makeTask({ id: 'moved', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'a', dueDate: '2026-11-01', order: 1 }),
        makeTask({ id: 'b', dueDate: '2026-11-01', order: 2 }),
        makeTask({ id: 'c', dueDate: '2026-11-01', order: 3 }),
      ]

      const result = computeReorder(tasks, 'moved', '2026-11-01', 2)

      expect(result).toContainEqual({ id: 'moved', dueDate: '2026-11-01', order: 2 })
      expect(result).toContainEqual({ id: 'a', order: 0 })
      expect(result).toContainEqual({ id: 'b', order: 1 })
      expect(result.find((u) => u.id === 'c')).toBeUndefined()
    })

    it('сдвиг назад (oldOrder > newOrder) → таски в [newOrder, oldOrder) сдвигаются +1', () => {
      const tasks: Task[] = [
        makeTask({ id: 'a', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'b', dueDate: '2026-11-01', order: 1 }),
        makeTask({ id: 'moved', dueDate: '2026-11-01', order: 2 }),
        makeTask({ id: 'c', dueDate: '2026-11-01', order: 3 }),
      ]

      const result = computeReorder(tasks, 'moved', '2026-11-01', 0)

      expect(result).toContainEqual({ id: 'moved', dueDate: '2026-11-01', order: 0 })
      expect(result).toContainEqual({ id: 'a', order: 1 })
      expect(result).toContainEqual({ id: 'b', order: 2 })
      expect(result.find((u) => u.id === 'c')).toBeUndefined()
    })

    it('та же позиция → никаких сдвигов, только сам таск', () => {
      const tasks: Task[] = [
        makeTask({ id: 'moved', dueDate: '2026-11-01', order: 1 }),
        makeTask({ id: 'other', dueDate: '2026-11-01', order: 0 }),
      ]

      const result = computeReorder(tasks, 'moved', '2026-11-01', 1)

      expect(result).toEqual([{ id: 'moved', dueDate: '2026-11-01', order: 1 }])
    })
  })

  describe('edge cases', () => {
    it('order === null у перемещаемого (был unplanned, получил дату)', () => {
      const tasks: Task[] = [
        makeTask({ id: 'moved', dueDate: null, order: null }),
        makeTask({ id: 'existing', dueDate: '2026-11-01', order: 0 }),
      ]

      const result = computeReorder(tasks, 'moved', '2026-11-01', 0)

      expect(result).toContainEqual({ id: 'moved', dueDate: '2026-11-01', order: 0 })
      expect(result).toContainEqual({ id: 'existing', order: 1 })
    })

    it('order === null у соседних тасков → они пропускаются', () => {
      const tasks: Task[] = [
        makeTask({ id: 'moved', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'null-order', dueDate: '2026-11-01', order: null }),
        makeTask({ id: 'valid', dueDate: '2026-11-01', order: 1 }),
      ]

      const result = computeReorder(tasks, 'moved', '2026-11-01', 1)

      expect(result).toContainEqual({ id: 'moved', dueDate: '2026-11-01', order: 1 })
      expect(result).toContainEqual({ id: 'valid', order: 0 })
      expect(result.find((u) => u.id === 'null-order')).toBeUndefined()
    })

    it('перемещение в пустую дату → только сам таск, order = newPosition', () => {
      const tasks: Task[] = [
        makeTask({ id: 'moved', dueDate: '2026-11-01', order: 2 }),
        makeTask({ id: 'other', dueDate: '2026-11-03', order: 0 }),
      ]

      const result = computeReorder(tasks, 'moved', '2026-11-02', 0)

      expect(result).toEqual([{ id: 'moved', dueDate: '2026-11-02', order: 0 }])
    })

    it('unplanned → unplanned (без даты) → нет reorder-логики', () => {
      const tasks: Task[] = [
        makeTask({ id: 'moved', dueDate: null, order: null }),
        makeTask({ id: 'other', dueDate: null, order: null }),
      ]

      const result = computeReorder(tasks, 'moved', null, 0)

      expect(result).toEqual([{ id: 'moved', dueDate: null, order: null }])
    })

    it('один таск в списке → только сам таск обновляется', () => {
      const tasks: Task[] = [makeTask({ id: 'only', dueDate: '2026-11-01', order: 0 })]

      const result = computeReorder(tasks, 'only', '2026-11-01', 0)

      expect(result).toEqual([{ id: 'only', dueDate: '2026-11-01', order: 0 }])
    })

    it('cross-date: сдвиг на новую дату с existing тасками на обеих датах', () => {
      const tasks: Task[] = [
        makeTask({ id: 'a', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'moved', dueDate: '2026-11-01', order: 1 }),
        makeTask({ id: 'b', dueDate: '2026-11-01', order: 2 }),
        makeTask({ id: 'c', dueDate: '2026-11-02', order: 0 }),
        makeTask({ id: 'd', dueDate: '2026-11-02', order: 1 }),
      ]

      const result = computeReorder(tasks, 'moved', '2026-11-02', 1)

      expect(result).toContainEqual({ id: 'moved', dueDate: '2026-11-02', order: 1 })
      expect(result).toContainEqual({ id: 'b', order: 1 })
      expect(result).toContainEqual({ id: 'd', order: 2 })
      expect(result.find((u) => u.id === 'a')).toBeUndefined()
      expect(result.find((u) => u.id === 'c')).toBeUndefined()
    })
  })
})
