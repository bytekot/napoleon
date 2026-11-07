import { defineStore } from 'pinia'
import * as api from '../api/tasks'
import type { Task } from '../types/tasks'
import type { RequestState } from '../types/request'
import { computeReorder } from '../utils/task/reordering'

interface TaskState {
  entities: Record<string, Task>
  ids: string[]
  request: RequestState
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error'
}

export const useTaskStore = defineStore('task', {
  state: (): TaskState => ({
    entities: {},
    ids: [],
    request: { status: 'idle' },
  }),

  getters: {
    taskById:
      (state) =>
      (id: string): Task | undefined =>
        state.entities[id],

    unplannedTaskIds(state): string[] {
      return state.ids
        .filter((id) => !state.entities[id]?.dueDate)
        .sort(
          (a, b) =>
            new Date(state.entities[a]!.creationDate).getTime() -
            new Date(state.entities[b]!.creationDate).getTime(),
        )
    },

    taskIdsByDueDate:
      (state) =>
      (dueDate: string): string[] =>
        state.ids
          .filter((id) => state.entities[id]?.dueDate === dueDate)
          .sort((a, b) => (state.entities[a]!.order ?? 0) - (state.entities[b]!.order ?? 0)),
  },

  actions: {
    async fetchTasks() {
      if (this.request.status !== 'idle') return

      this.request = { status: 'pending' }

      try {
        const tasks = await api.getTasks()

        this.entities = Object.fromEntries(tasks.map((task) => [task.id, task]))
        this.ids = tasks.map((task) => task.id)
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
        this.ids = this.ids.map((id) => (id === tempId ? task.id : id))
        this.entities[task.id] = task
      } catch (error) {
        delete this.entities[tempId]
        this.ids = this.ids.filter((id) => id !== tempId)
        this.request = { status: 'error', error: toMessage(error) }
      }
    },

    async editTask(params: api.EditTaskPayload) {
      const previous = this.entities[params.id]

      if (!previous) return

      const updated = { ...previous }

      if (params.completed !== undefined) updated.completed = params.completed
      if (params.dueDate !== undefined) updated.dueDate = params.dueDate
      if (params.order !== undefined) updated.order = params.order
      if (params.name !== undefined) updated.name = params.name

      this.entities[params.id] = updated

      try {
        const response = await api.editTasks([params])

        response.forEach((task) => {
          this.entities[task.id] = task
        })
      } catch (error) {
        this.entities[params.id] = previous
        this.request = { status: 'error', error: toMessage(error) }
      }
    },

    async reorderTask(taskId: string, newDueDate: string | null, newPosition: number) {
      const allTasks = Object.values(this.entities)
      const updates = computeReorder(allTasks, taskId, newDueDate, newPosition)

      if (updates.length === 0) return

      const previousStates: Record<string, Task> = {}

      for (const update of updates) {
        const task = this.entities[update.id]

        if (task) {
          previousStates[update.id] = { ...task }

          const optimistic = { ...task }

          if (update.dueDate !== undefined) optimistic.dueDate = update.dueDate
          if (update.order !== undefined) optimistic.order = update.order

          this.entities[update.id] = optimistic
        }
      }

      try {
        const response = await api.editTasks(updates)

        response.forEach((task) => {
          this.entities[task.id] = task
        })
      } catch (error) {
        for (const [id, prev] of Object.entries(previousStates)) {
          this.entities[id] = prev
        }

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
        await api.deleteTasks([id])
      } catch (error) {
        this.entities[id] = previous
        this.ids.splice(previousIndex, 0, id)
        this.request = { status: 'error', error: toMessage(error) }
      }
    },
  },
})
