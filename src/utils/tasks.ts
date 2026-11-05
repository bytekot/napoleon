import type { Task } from '../types/tasks'

export interface ReorderUpdate {
  id: string
  order: number | null
  dueDate?: string | null
}

export function computeReorder(
  allTasks: Task[],
  movedTaskId: string,
  newDueDate: string | null,
  newPosition: number,
): ReorderUpdate[] {
  const movedTask = allTasks.find((t) => t.id === movedTaskId)

  if (!movedTask) return []

  const oldDueDate = movedTask.dueDate
  const oldOrder = movedTask.order

  if (newDueDate === null) {
    return [{ id: movedTaskId, dueDate: null, order: null }]
  }

  const updates: ReorderUpdate[] = []
  const dateChanged = oldDueDate !== newDueDate

  if (dateChanged) {
    for (const task of allTasks) {
      if (task.id === movedTaskId) continue
      if (task.order === null) continue

      if (task.dueDate === newDueDate && task.order >= newPosition) {
        updates.push({ id: task.id, order: task.order + 1 })
      } else if (task.dueDate === oldDueDate && task.order > oldOrder!) {
        updates.push({ id: task.id, order: task.order - 1 })
      }
    }

    updates.push({ id: movedTaskId, dueDate: newDueDate, order: newPosition })
  } else {
    if (oldOrder === newPosition) {
      return [{ id: movedTaskId, dueDate: newDueDate, order: newPosition }]
    }

    for (const task of allTasks) {
      if (task.id === movedTaskId) continue
      if (task.order === null) continue
      if (task.dueDate !== newDueDate) continue

      if (oldOrder === null) {
        if (task.order >= newPosition) {
          updates.push({ id: task.id, order: task.order + 1 })
        }
      } else if (oldOrder < newPosition) {
        if (task.order > oldOrder && task.order <= newPosition) {
          updates.push({ id: task.id, order: task.order - 1 })
        }
      } else {
        if (task.order >= newPosition && task.order < oldOrder) {
          updates.push({ id: task.id, order: task.order + 1 })
        }
      }
    }

    updates.push({ id: movedTaskId, dueDate: newDueDate, order: newPosition })
  }

  return updates
}

export function getDraggedTaskOrder(element: Element, clientY: number): number {
  const tasksEl = element.closest('[data-task-list]')

  if (!tasksEl) return 0

  const taskEl = element.closest('[data-task]')

  if (taskEl) {
    const { y, height } = taskEl.getBoundingClientRect()
    const order = Array.from(tasksEl.children).indexOf(taskEl)

    if (order === -1) return tasksEl.childElementCount

    return clientY < y + height / 2 ? order : order + 1
  }

  return tasksEl.childElementCount
}
