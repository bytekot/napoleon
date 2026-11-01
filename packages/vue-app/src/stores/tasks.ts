import { defineStore } from 'pinia'
import * as api from '../api/tasks'
import type { Task } from '../types/tasks'
import type { RequestState } from '../types/request'

interface TasksState {
  entities: Record<string, Task>
  ids: string[]
  request: RequestState
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error'
}

export const useTasksStore = defineStore('tasks', {
  state: (): TasksState => ({
    entities: {},
    ids: [],
    request: { status: 'idle' },
  }),

  getters: {
    taskById: (state) => (id: string): Task | undefined => state.entities[id],

    unplannedTaskIds(state): string[] {
      return state.ids
        .filter(id => !state.entities[id]?.dueDate)
        .sort((a, b) =>
          new Date(state.entities[a]!.creationDate).getTime() -
          new Date(state.entities[b]!.creationDate).getTime()
        )
    },

    taskIdsByDueDate: (state) => (dueDate: string): string[] =>
      state.ids
        .filter(id => state.entities[id]?.dueDate === dueDate)
        .sort((a, b) =>
          (state.entities[a]!.order ?? 0) - (state.entities[b]!.order ?? 0)
        ),
  },

  actions: {
    async fetchTasks() {
      if (this.request.status !== 'idle') return

      this.request = { status: 'pending' }

      try {
        const tasks = await api.getTasks()

        this.entities = Object.fromEntries(tasks.map(task => [task.id, task]))
        this.ids = tasks.map(task => task.id)
        this.request = { status: 'success' }
      } catch (error) {
        this.request = { status: 'error', error: toMessage(error) }
      }
    },

    async createTask(params: api.CreateTaskParams) {
      const tempId = `temp-${crypto.randomUUID()}`

      this.entities[tempId] = {
        id: tempId,
        name: params.name,
        creationDate: params.creationDate,
        dueDate: null,
        order: null,
        completed: false,
      }
      this.ids.push(tempId)

      try {
        const task = await api.createTask(params)

        delete this.entities[tempId]
        this.ids = this.ids.map(id => id === tempId ? task.id : id)
        this.entities[task.id] = task
      } catch (error) {
        delete this.entities[tempId]
        this.ids = this.ids.filter(id => id !== tempId)
        this.request = { status: 'error', error: toMessage(error) }
      }
    },

    async editTask(params: api.EditTaskParams) {
      const previous = this.entities[params.id]
      if (!previous) return

      const updated = { ...previous }
      if (params.completed !== undefined) updated.completed = params.completed
      if (params.dueDate !== undefined) updated.dueDate = params.dueDate
      if (typeof params.order === 'number') updated.order = params.order - 0.5

      this.entities[params.id] = updated

      try {
        const response = await api.editTask(params)

        if (Array.isArray(response)) {
          response.forEach(task => { this.entities[task.id] = task })
        } else {
          this.entities[response.id] = response
        }
      } catch (error) {
        this.entities[params.id] = previous
        this.request = { status: 'error', error: toMessage(error) }
      }
    },

    async deleteTask(id: string) {
      const previous = this.entities[id]
      const previousIndex = this.ids.indexOf(id)

      if (!previous || previousIndex === -1) return

      delete this.entities[id]
      this.ids.splice(previousIndex, 1)

      try {
        await api.deleteTask(id)
      } catch (error) {
        this.entities[id] = previous
        this.ids.splice(previousIndex, 0, id)
        this.request = { status: 'error', error: toMessage(error) }
      }
    },
  },
})
