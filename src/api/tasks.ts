import { request } from './client'
import type { Task } from '../types/tasks'

export interface CreateTaskParams {
  name: string
  creationDate: string
}

export interface EditTaskPayload {
  id: string
  dueDate?: string | null
  order?: number | null
  completed?: boolean
  name?: string
}

export const getTasks = () => request<Task[]>('/tasks')

export const createTask = (params: CreateTaskParams) =>
  request<Task>('/tasks', { method: 'POST', body: JSON.stringify(params) })

export const editTasks = (updates: EditTaskPayload[]) =>
  request<Task[]>('/tasks', { method: 'PATCH', body: JSON.stringify(updates) })

export const deleteTasks = (ids: string[]) =>
  request<string[]>('/tasks', { method: 'DELETE', body: JSON.stringify(ids) })
