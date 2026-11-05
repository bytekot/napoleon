import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTaskStore } from '../task'
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

describe('useTaskStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('fetchTasks', () => {
    it('пустой ответ → status: success, ids: []', async () => {
      mockApi.getTasks.mockResolvedValue([])
      const store = useTaskStore()

      await store.fetchTasks()

      expect(store.request).toEqual({ status: 'success' })
      expect(store.ids).toEqual([])
      expect(store.entities).toEqual({})
    })

    it('повторный вызов не делает запрос', async () => {
      mockApi.getTasks.mockResolvedValue([])
      const store = useTaskStore()

      await store.fetchTasks()
      await store.fetchTasks()

      expect(mockApi.getTasks).toHaveBeenCalledTimes(1)
    })

    it('ошибка → status: error с сообщением', async () => {
      mockApi.getTasks.mockRejectedValue(new Error('Network error'))
      const store = useTaskStore()

      await store.fetchTasks()

      expect(store.request).toEqual({ status: 'error', error: 'Network error' })
    })

    it('заполняет entities и ids', async () => {
      const tasks = [makeTask({ id: 'a' }), makeTask({ id: 'b' })]

      mockApi.getTasks.mockResolvedValue(tasks)
      const store = useTaskStore()

      await store.fetchTasks()

      expect(store.ids).toEqual(['a', 'b'])
      expect(store.entities.a).toEqual(tasks[0])
      expect(store.entities.b).toEqual(tasks[1])
    })
  })

  describe('createTask', () => {
    it('temp id появляется сразу', async () => {
      mockApi.createTask.mockImplementation(neverResolve)
      const store = useTaskStore()

      void store.createTask({ name: 'New', creationDate: '2026-11-01' })

      await vi.waitFor(() => {
        expect(store.ids.some((id) => id.startsWith('temp-'))).toBe(true)
      })
    })

    it('temp id заменяется на серверный на том же месте', async () => {
      const serverTask = makeTask({ id: 'server-id', name: 'New' })

      mockApi.createTask.mockResolvedValue(serverTask)
      const store = useTaskStore()

      await store.createTask({ name: 'New', creationDate: '2026-11-01' })

      expect(store.ids).toEqual(['server-id'])
      expect(store.entities['server-id']).toEqual(serverTask)
      expect(Object.keys(store.entities).some((k) => k.startsWith('temp-'))).toBe(false)
    })

    it('при ошибке temp id удаляется', async () => {
      mockApi.createTask.mockRejectedValue(new Error('Fail'))
      const store = useTaskStore()

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

      mockApi.editTasks.mockResolvedValue([updated])
      const store = useTaskStore()

      store.entities[task.id] = task
      store.ids = [task.id]

      await store.editTask({ id: task.id, completed: true })

      expect(store.entities[task.id]!.completed).toBe(true)
    })

    it('optimistic update применяется сразу', async () => {
      const task = makeTask({ completed: false })

      mockApi.editTasks.mockImplementation(neverResolve)
      const store = useTaskStore()

      store.entities[task.id] = task
      store.ids = [task.id]

      void store.editTask({ id: task.id, completed: true })

      await vi.waitFor(() => {
        expect(store.entities[task.id]!.completed).toBe(true)
      })
    })

    it('при ошибке состояние откатывается', async () => {
      const task = makeTask({ completed: false })

      mockApi.editTasks.mockRejectedValue(new Error('Fail'))
      const store = useTaskStore()

      store.entities[task.id] = task
      store.ids = [task.id]

      await store.editTask({ id: task.id, completed: true })

      expect(store.entities[task.id]!.completed).toBe(false)
      expect(store.request.status).toBe('error')
    })
  })

  describe('reorderTask', () => {
    it('optimistic update применяется ко всем затронутым таскам', async () => {
      const moved = makeTask({ id: 'moved', dueDate: '2026-11-01', order: 0 })
      const sibling = makeTask({ id: 'sibling', dueDate: '2026-11-01', order: 1 })

      mockApi.editTasks.mockImplementation(neverResolve)
      const store = useTaskStore()

      store.entities = { moved, sibling }
      store.ids = ['moved', 'sibling']

      void store.reorderTask('moved', '2026-11-01', 1)

      await vi.waitFor(() => {
        expect(store.entities.moved!.order).toBe(1)
        expect(store.entities.sibling!.order).toBe(0)
      })
    })

    it('ответ сервера заменяет optimistic updates', async () => {
      const moved = makeTask({ id: 'moved', dueDate: '2026-11-01', order: 0 })
      const sibling = makeTask({ id: 'sibling', dueDate: '2026-11-01', order: 1 })
      const serverResponse = [
        makeTask({ id: 'moved', dueDate: '2026-11-01', order: 1 }),
        makeTask({ id: 'sibling', dueDate: '2026-11-01', order: 0 }),
      ]

      mockApi.editTasks.mockResolvedValue(serverResponse)
      const store = useTaskStore()

      store.entities = { moved, sibling }
      store.ids = ['moved', 'sibling']

      await store.reorderTask('moved', '2026-11-01', 1)

      expect(store.entities.moved!.order).toBe(1)
      expect(store.entities.sibling!.order).toBe(0)
    })

    it('при ошибке все затронутые таски откатываются', async () => {
      const moved = makeTask({ id: 'moved', dueDate: '2026-11-01', order: 0 })
      const sibling = makeTask({ id: 'sibling', dueDate: '2026-11-01', order: 1 })

      mockApi.editTasks.mockRejectedValue(new Error('Fail'))
      const store = useTaskStore()

      store.entities = { moved, sibling }
      store.ids = ['moved', 'sibling']

      await store.reorderTask('moved', '2026-11-01', 1)

      expect(store.entities.moved!.order).toBe(0)
      expect(store.entities.sibling!.order).toBe(1)
      expect(store.request.status).toBe('error')
    })

    it('cross-date move: обновляет dueDate и order', async () => {
      const moved = makeTask({ id: 'moved', dueDate: '2026-11-01', order: 0 })
      const target = makeTask({ id: 'target', dueDate: '2026-11-02', order: 0 })

      mockApi.editTasks.mockImplementation(neverResolve)
      const store = useTaskStore()

      store.entities = { moved, target }
      store.ids = ['moved', 'target']

      void store.reorderTask('moved', '2026-11-02', 0)

      await vi.waitFor(() => {
        expect(store.entities.moved!.dueDate).toBe('2026-11-02')
        expect(store.entities.moved!.order).toBe(0)
        expect(store.entities.target!.order).toBe(1)
      })
    })
  })

  describe('deleteTask', () => {
    it('удаление оптимистичное, при ошибке — откат', async () => {
      const task = makeTask()

      mockApi.deleteTask.mockRejectedValue(new Error('Fail'))
      const store = useTaskStore()

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
      const store = useTaskStore()

      store.entities[task.id] = task
      store.ids = [task.id]

      await store.deleteTask(task.id)

      expect(store.entities[task.id]).toBeUndefined()
      expect(store.ids).toEqual([])
    })
  })

  describe('getters', () => {
    it('taskById: несуществующий id → undefined', () => {
      const store = useTaskStore()

      expect(store.taskById('nonexistent')).toBeUndefined()
    })

    it('unplannedTaskIds: сортировка по creationDate, только без dueDate', () => {
      const store = useTaskStore()

      store.entities = {
        a: makeTask({ id: 'a', creationDate: '2026-11-03', dueDate: null }),
        b: makeTask({ id: 'b', creationDate: '2026-11-01', dueDate: '2026-11-05' }),
        c: makeTask({ id: 'c', creationDate: '2026-11-02', dueDate: null }),
      }
      store.ids = ['a', 'b', 'c']

      expect(store.unplannedTaskIds).toEqual(['c', 'a'])
    })

    it('taskIdsByDueDate: сортировка по order, null трактуется как 0', () => {
      const store = useTaskStore()

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
