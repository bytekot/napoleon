import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTasksStore } from '../tasks'
import * as api from '../../api/tasks'
import type { Task } from '../../types/tasks'

vi.mock('../../api/tasks')

const mockApi = vi.mocked(api)

function neverResolve(): Promise<never> {
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- intentionally never-resolving promise for optimistic update tests
  return new Promise(() => {})
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: '1',
    name: 'Test task',
    creationDate: '2026-11-01',
    dueDate: null,
    order: null,
    completed: false,
    ...overrides,
  }
}

describe('useTasksStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('fetchTasks', () => {
    it('пустой ответ → status: success, ids: []', async () => {
      mockApi.getTasks.mockResolvedValue([])
      const store = useTasksStore()

      await store.fetchTasks()

      expect(store.request).toEqual({ status: 'success' })
      expect(store.ids).toEqual([])
      expect(store.entities).toEqual({})
    })

    it('повторный вызов не делает запрос', async () => {
      mockApi.getTasks.mockResolvedValue([])
      const store = useTasksStore()

      await store.fetchTasks()
      await store.fetchTasks()

      expect(mockApi.getTasks).toHaveBeenCalledTimes(1)
    })

    it('ошибка → status: error с сообщением', async () => {
      mockApi.getTasks.mockRejectedValue(new Error('Network error'))
      const store = useTasksStore()

      await store.fetchTasks()

      expect(store.request).toEqual({ status: 'error', error: 'Network error' })
    })

    it('заполняет entities и ids', async () => {
      const tasks = [makeTask({ id: 'a' }), makeTask({ id: 'b' })]
      mockApi.getTasks.mockResolvedValue(tasks)
      const store = useTasksStore()

      await store.fetchTasks()

      expect(store.ids).toEqual(['a', 'b'])
      expect(store.entities.a).toEqual(tasks[0])
      expect(store.entities.b).toEqual(tasks[1])
    })
  })

  describe('createTask', () => {
    it('temp id появляется сразу', async () => {
      mockApi.createTask.mockImplementation(neverResolve)
      const store = useTasksStore()

      void store.createTask({ name: 'New', creationDate: '2026-11-01' })

      await vi.waitFor(() => {
        expect(store.ids.some((id) => id.startsWith('temp-'))).toBe(true)
      })
    })

    it('temp id заменяется на серверный на том же месте', async () => {
      const serverTask = makeTask({ id: 'server-id', name: 'New' })
      mockApi.createTask.mockResolvedValue(serverTask)
      const store = useTasksStore()

      await store.createTask({ name: 'New', creationDate: '2026-11-01' })

      expect(store.ids).toEqual(['server-id'])
      expect(store.entities['server-id']).toEqual(serverTask)
      expect(Object.keys(store.entities).some((k) => k.startsWith('temp-'))).toBe(false)
    })

    it('при ошибке temp id удаляется', async () => {
      mockApi.createTask.mockRejectedValue(new Error('Fail'))
      const store = useTasksStore()

      await store.createTask({ name: 'New', creationDate: '2026-11-01' })

      expect(store.ids).toEqual([])
      expect(Object.keys(store.entities)).toEqual([])
      expect(store.request.status).toBe('error')
    })
  })

  describe('editTask', () => {
    it('при completed: true ответ сервера применяется', async () => {
      const task = makeTask({ completed: false })
      const updated = makeTask({ completed: true })
      mockApi.editTask.mockResolvedValue(updated)
      const store = useTasksStore()
      store.entities[task.id] = task
      store.ids = [task.id]

      await store.editTask({ id: task.id, completed: true })

      expect(store.entities[task.id]!.completed).toBe(true)
    })

    it('при order: 0 смещение -0.5 применяется', async () => {
      const task = makeTask({ order: 5 })
      mockApi.editTask.mockImplementation(neverResolve)
      const store = useTasksStore()
      store.entities[task.id] = task
      store.ids = [task.id]

      void store.editTask({ id: task.id, order: 0 })

      await vi.waitFor(() => {
        expect(store.entities[task.id]!.order).toBe(-0.5)
      })
    })

    it('ответ-массив обновляет все затронутые сущности', async () => {
      const task1 = makeTask({ id: '1', order: 1 })
      const task2 = makeTask({ id: '2', order: 2 })
      const reordered = [makeTask({ id: '1', order: 2 }), makeTask({ id: '2', order: 1 })]
      mockApi.editTask.mockResolvedValue(reordered)
      const store = useTasksStore()
      store.entities = { '1': task1, '2': task2 }
      store.ids = ['1', '2']

      await store.editTask({ id: '1', order: 1 })

      expect(store.entities['1']!.order).toBe(2)
      expect(store.entities['2']!.order).toBe(1)
    })

    it('при ошибке состояние откатывается', async () => {
      const task = makeTask({ order: 5 })
      mockApi.editTask.mockRejectedValue(new Error('Fail'))
      const store = useTasksStore()
      store.entities[task.id] = task
      store.ids = [task.id]

      await store.editTask({ id: task.id, order: 10 })

      expect(store.entities[task.id]!.order).toBe(5)
      expect(store.request.status).toBe('error')
    })
  })

  describe('deleteTask', () => {
    it('удаление оптимистичное, при ошибке — откат', async () => {
      const task = makeTask()
      mockApi.deleteTask.mockRejectedValue(new Error('Fail'))
      const store = useTasksStore()
      store.entities[task.id] = task
      store.ids = [task.id]

      await store.deleteTask(task.id)

      expect(store.entities[task.id]).toEqual(task)
      expect(store.ids).toEqual([task.id])
      expect(store.request.status).toBe('error')
    })

    it('успешное удаление', async () => {
      const task = makeTask()
      mockApi.deleteTask.mockResolvedValue(task.id)
      const store = useTasksStore()
      store.entities[task.id] = task
      store.ids = [task.id]

      await store.deleteTask(task.id)

      expect(store.entities[task.id]).toBeUndefined()
      expect(store.ids).toEqual([])
    })
  })

  describe('getters', () => {
    it('taskById: несуществующий id → undefined', () => {
      const store = useTasksStore()
      expect(store.taskById('nonexistent')).toBeUndefined()
    })

    it('unplannedTaskIds: сортировка по creationDate, только без dueDate', () => {
      const store = useTasksStore()
      store.entities = {
        a: makeTask({ id: 'a', creationDate: '2026-11-03', dueDate: null }),
        b: makeTask({ id: 'b', creationDate: '2026-11-01', dueDate: '2026-11-05' }),
        c: makeTask({ id: 'c', creationDate: '2026-11-02', dueDate: null }),
      }
      store.ids = ['a', 'b', 'c']

      expect(store.unplannedTaskIds).toEqual(['c', 'a'])
    })

    it('taskIdsByDueDate: сортировка по order, null трактуется как 0', () => {
      const store = useTasksStore()
      store.entities = {
        a: makeTask({ id: 'a', dueDate: '2026-11-05', order: 2 }),
        b: makeTask({ id: 'b', dueDate: '2026-11-05', order: null }),
        c: makeTask({ id: 'c', dueDate: '2026-11-05', order: 1 }),
        d: makeTask({ id: 'd', dueDate: '2026-11-06', order: 0 }),
      }
      store.ids = ['a', 'b', 'c', 'd']

      expect(store.taskIdsByDueDate('2026-11-05')).toEqual(['b', 'c', 'a'])
    })
  })
})
