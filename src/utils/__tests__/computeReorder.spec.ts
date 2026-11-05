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
  describe('Группа A: Перемещение между разными днями', () => {
    it('A1: В пустой день', () => {
      const tasks: Task[] = [makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 })]

      const result = computeReorder(tasks, 'X', '2026-11-02', 0)

      expect(result).toEqual([{ id: 'X', dueDate: '2026-11-02', order: 0 }])
    })

    it('A2: В начало непустого дня', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Y', dueDate: '2026-11-02', order: 0 }),
        makeTask({ id: 'Z', dueDate: '2026-11-02', order: 1 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-02', 0)

      expect(result).toContainEqual({ id: 'X', dueDate: '2026-11-02', order: 0 })
      expect(result).toContainEqual({ id: 'Y', order: 1 })
      expect(result).toContainEqual({ id: 'Z', order: 2 })
      expect(result).toHaveLength(3)
    })

    it('A3: В середину непустого дня', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Y', dueDate: '2026-11-02', order: 0 }),
        makeTask({ id: 'Z', dueDate: '2026-11-02', order: 1 }),
        makeTask({ id: 'W', dueDate: '2026-11-02', order: 2 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-02', 1)

      expect(result).toContainEqual({ id: 'X', dueDate: '2026-11-02', order: 1 })
      expect(result).toContainEqual({ id: 'Z', order: 2 })
      expect(result).toContainEqual({ id: 'W', order: 3 })
      expect(result.find((u) => u.id === 'Y')).toBeUndefined()
      expect(result).toHaveLength(3)
    })

    it('A4: В конец непустого дня', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Y', dueDate: '2026-11-02', order: 0 }),
        makeTask({ id: 'Z', dueDate: '2026-11-02', order: 1 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-02', 2)

      expect(result).toEqual([{ id: 'X', dueDate: '2026-11-02', order: 2 }])
    })

    it('A5: В день с 1 задачей — перед ней', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Y', dueDate: '2026-11-02', order: 0 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-02', 0)

      expect(result).toContainEqual({ id: 'X', dueDate: '2026-11-02', order: 0 })
      expect(result).toContainEqual({ id: 'Y', order: 1 })
      expect(result).toHaveLength(2)
    })

    it('A6: В день с 1 задачей — после неё', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Y', dueDate: '2026-11-02', order: 0 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-02', 1)

      expect(result).toEqual([{ id: 'X', dueDate: '2026-11-02', order: 1 }])
    })

    it('A7: Исходный день опустел (единственная задача ушла)', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Y', dueDate: '2026-11-02', order: 0 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-02', 0)

      expect(result).toContainEqual({ id: 'X', dueDate: '2026-11-02', order: 0 })
      expect(result).toContainEqual({ id: 'Y', order: 1 })
      expect(result.find((u) => u.id === 'X' && u.order !== 0)).toBeUndefined()
    })

    it('A8: Исходный день не опустел — уплотнение', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'P', dueDate: '2026-11-01', order: 1 }),
        makeTask({ id: 'Q', dueDate: '2026-11-01', order: 2 }),
        makeTask({ id: 'Y', dueDate: '2026-11-02', order: 0 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-02', 0)

      expect(result).toContainEqual({ id: 'X', dueDate: '2026-11-02', order: 0 })
      expect(result).toContainEqual({ id: 'P', order: 0 })
      expect(result).toContainEqual({ id: 'Q', order: 1 })
      expect(result).toContainEqual({ id: 'Y', order: 1 })
      expect(result).toHaveLength(4)
    })
  })

  describe('Группа B: Перемещение внутри того же дня (DOM-позиция)', () => {
    it('B1: No-op — drop на верхней половине своей карты', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Y', dueDate: '2026-11-01', order: 1 }),
        makeTask({ id: 'Z', dueDate: '2026-11-01', order: 2 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-01', 0)

      expect(result).toEqual([])
    })

    it('B1b: No-op — drop на нижней половине своей карты (соседняя позиция)', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Y', dueDate: '2026-11-01', order: 1 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-01', 1)

      expect(result).toEqual([])
    })

    it('B2: Сдвиг вверх (к началу)', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Y', dueDate: '2026-11-01', order: 1 }),
        makeTask({ id: 'Z', dueDate: '2026-11-01', order: 2 }),
        makeTask({ id: 'W', dueDate: '2026-11-01', order: 3 }),
      ]

      const result = computeReorder(tasks, 'W', '2026-11-01', 1)

      expect(result).toContainEqual({ id: 'W', dueDate: '2026-11-01', order: 1 })
      expect(result).toContainEqual({ id: 'Y', order: 2 })
      expect(result).toContainEqual({ id: 'Z', order: 3 })
      expect(result.find((u) => u.id === 'X')).toBeUndefined()
      expect(result).toHaveLength(3)
    })

    it('B3: Сдвиг вниз (к концу), DOM-позиция нормализуется на −1', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Y', dueDate: '2026-11-01', order: 1 }),
        makeTask({ id: 'Z', dueDate: '2026-11-01', order: 2 }),
        makeTask({ id: 'W', dueDate: '2026-11-01', order: 3 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-01', 3)

      expect(result).toContainEqual({ id: 'X', dueDate: '2026-11-01', order: 2 })
      expect(result).toContainEqual({ id: 'Y', order: 0 })
      expect(result).toContainEqual({ id: 'Z', order: 1 })
      expect(result.find((u) => u.id === 'W')).toBeUndefined()
      expect(result).toHaveLength(3)
    })

    it('B4: Перемещение в начало', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Y', dueDate: '2026-11-01', order: 1 }),
        makeTask({ id: 'Z', dueDate: '2026-11-01', order: 2 }),
      ]

      const result = computeReorder(tasks, 'Z', '2026-11-01', 0)

      expect(result).toContainEqual({ id: 'Z', dueDate: '2026-11-01', order: 0 })
      expect(result).toContainEqual({ id: 'X', order: 1 })
      expect(result).toContainEqual({ id: 'Y', order: 2 })
      expect(result).toHaveLength(3)
    })

    it('B5: Перемещение в конец (drop в пустую область, позиция = N)', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Y', dueDate: '2026-11-01', order: 1 }),
        makeTask({ id: 'Z', dueDate: '2026-11-01', order: 2 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-01', 3)

      expect(result).toContainEqual({ id: 'X', dueDate: '2026-11-01', order: 2 })
      expect(result).toContainEqual({ id: 'Y', order: 0 })
      expect(result).toContainEqual({ id: 'Z', order: 1 })
      expect(result).toHaveLength(3)
    })

    it('B6: Единственная задача в дне — no-op при любой позиции', () => {
      const tasks: Task[] = [makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 })]

      expect(computeReorder(tasks, 'X', '2026-11-01', 0)).toEqual([])
      expect(computeReorder(tasks, 'X', '2026-11-01', 1)).toEqual([])
    })

    it('B7: Swap двух задач', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Y', dueDate: '2026-11-01', order: 1 }),
      ]

      const result = computeReorder(tasks, 'Y', '2026-11-01', 0)

      expect(result).toContainEqual({ id: 'Y', dueDate: '2026-11-01', order: 0 })
      expect(result).toContainEqual({ id: 'X', order: 1 })
      expect(result).toHaveLength(2)
    })
  })

  describe('Группа C: Из TaskForm в день (dueDate был null)', () => {
    it('C1: В пустой день', () => {
      const tasks: Task[] = [makeTask({ id: 'X', dueDate: null, order: null })]

      const result = computeReorder(tasks, 'X', '2026-11-01', 0)

      expect(result).toEqual([{ id: 'X', dueDate: '2026-11-01', order: 0 }])
    })

    it('C2: В начало непустого дня', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: null, order: null }),
        makeTask({ id: 'Y', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Z', dueDate: '2026-11-01', order: 1 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-01', 0)

      expect(result).toContainEqual({ id: 'X', dueDate: '2026-11-01', order: 0 })
      expect(result).toContainEqual({ id: 'Y', order: 1 })
      expect(result).toContainEqual({ id: 'Z', order: 2 })
      expect(result).toHaveLength(3)
    })

    it('C3: В середину непустого дня', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: null, order: null }),
        makeTask({ id: 'Y', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Z', dueDate: '2026-11-01', order: 1 }),
        makeTask({ id: 'W', dueDate: '2026-11-01', order: 2 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-01', 1)

      expect(result).toContainEqual({ id: 'X', dueDate: '2026-11-01', order: 1 })
      expect(result).toContainEqual({ id: 'Z', order: 2 })
      expect(result).toContainEqual({ id: 'W', order: 3 })
      expect(result.find((u) => u.id === 'Y')).toBeUndefined()
      expect(result).toHaveLength(3)
    })

    it('C4: В конец непустого дня', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: null, order: null }),
        makeTask({ id: 'Y', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Z', dueDate: '2026-11-01', order: 1 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-01', 2)

      expect(result).toEqual([{ id: 'X', dueDate: '2026-11-01', order: 2 }])
    })

    it('C5: Задача уже имеет dueDate — обрабатывается как cross-date move', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Y', dueDate: '2026-11-02', order: 0 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-02', 0)

      expect(result).toContainEqual({ id: 'X', dueDate: '2026-11-02', order: 0 })
      expect(result).toContainEqual({ id: 'Y', order: 1 })
      expect(result).toHaveLength(2)
    })
  })

  describe('Группа D: Из дня в TaskForm (сброс даты)', () => {
    it('D1: Сброс даты — уплотнение исходного дня', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Y', dueDate: '2026-11-01', order: 1 }),
        makeTask({ id: 'Z', dueDate: '2026-11-01', order: 2 }),
      ]

      const result = computeReorder(tasks, 'Y', null, 0)

      expect(result).toContainEqual({ id: 'Y', dueDate: null, order: null })
      expect(result).toContainEqual({ id: 'Z', order: 1 })
      expect(result.find((u) => u.id === 'X')).toBeUndefined()
      expect(result).toHaveLength(2)
    })

    it('D2: Сброс даты у единственной задачи в дне', () => {
      const tasks: Task[] = [makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 })]

      const result = computeReorder(tasks, 'X', null, 0)

      expect(result).toEqual([{ id: 'X', dueDate: null, order: null }])
    })
  })

  describe('Группа E: Граничные случаи и ошибки', () => {
    it('E1: Несуществующая задача', () => {
      const tasks: Task[] = [makeTask({ id: 'Y', dueDate: '2026-11-01', order: 0 })]

      const result = computeReorder(tasks, 'nonexistent', '2026-11-01', 0)

      expect(result).toEqual([])
    })

    it('E3a: Позиция < 0', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Y', dueDate: '2026-11-02', order: 0 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-02', -1)

      expect(result).toEqual([])
    })

    it('E3b: Позиция > N (cross-date)', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Y', dueDate: '2026-11-02', order: 0 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-02', 5)

      expect(result).toEqual([])
    })

    it('E3c: Позиция > N (same-date)', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Y', dueDate: '2026-11-01', order: 1 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-01', 3)

      expect(result).toEqual([])
    })

    it('E3d: Нецелочисленная позиция', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'Y', dueDate: '2026-11-02', order: 0 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-02', 0.5)

      expect(result).toEqual([])
    })

    it('E7: Уже в целевой позиции (same date, same order)', () => {
      const tasks: Task[] = [
        makeTask({ id: 'Y', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 1 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-01', 1)

      expect(result).toEqual([])
    })

    it('unplanned → unplanned (без даты) → no-op', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: null, order: null }),
        makeTask({ id: 'Y', dueDate: null, order: null }),
      ]

      const result = computeReorder(tasks, 'X', null, 0)

      expect(result).toEqual([])
    })

    it('задачи с order=null в целевом дне чинятся при перенумерации', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: null, order: null }),
        makeTask({ id: 'null-order', dueDate: '2026-11-01', order: null }),
        makeTask({ id: 'valid', dueDate: '2026-11-01', order: 0 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-01', 0)

      expect(result).toContainEqual({ id: 'X', dueDate: '2026-11-01', order: 0 })
      expect(result).toContainEqual({ id: 'null-order', order: 1 })
      expect(result).toContainEqual({ id: 'valid', order: 2 })
      expect(result).toHaveLength(3)
    })

    it('задачи других дней не затрагиваются', () => {
      const tasks: Task[] = [
        makeTask({ id: 'X', dueDate: '2026-11-01', order: 0 }),
        makeTask({ id: 'other', dueDate: '2026-11-03', order: 0 }),
      ]

      const result = computeReorder(tasks, 'X', '2026-11-02', 0)

      expect(result).toEqual([{ id: 'X', dueDate: '2026-11-02', order: 0 }])
    })
  })
})
