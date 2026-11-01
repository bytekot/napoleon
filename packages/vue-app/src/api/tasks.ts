import { request } from './client'
import type { Task } from '../types/tasks'

export interface CreateTaskParams {
  name: string
  creationDate: string
}

/**
 * ВАЖНО: при добавлении нового поля необходимо обновить optimistic update
 * в `src/stores/tasks.ts` → action `editTask`.
 */
export interface EditTaskParams {
  id: string
  dueDate?: string | null
  order?: number | null
  completed?: boolean
}

export type EditTaskResponse = Task | Task[]

export const getTasks = () => request<Task[]>('/tasks')

export const createTask = (params: CreateTaskParams) =>
  request<Task>('/task', { method: 'POST', body: JSON.stringify(params) })

export const editTask = ({ id, ...body }: EditTaskParams) =>
  request<EditTaskResponse>(`/task${id}`, { method: 'PATCH', body: JSON.stringify(body) })

export const deleteTask = (id: string) => request<string>(`/task${id}`, { method: 'DELETE' })
