import type { Task } from '../../types/tasks'

export interface ReorderUpdate {
  id: string
  order: number | null
  dueDate?: string | null
}

const ORDER_NULL_FALLBACK = 0

function compareByOrder(a: Task, b: Task): number {
  return (a.order ?? ORDER_NULL_FALLBACK) - (b.order ?? ORDER_NULL_FALLBACK)
}

function tasksByDay(allTasks: Task[], dueDate: string): Task[] {
  return allTasks.filter((t) => t.dueDate === dueDate).sort(compareByOrder)
}

function diffOrders(sortedList: Task[]): ReorderUpdate[] {
  const updates: ReorderUpdate[] = []

  for (let i = 0; i < sortedList.length; i++) {
    const task = sortedList[i]!

    if (task.order !== i) {
      updates.push({ id: task.id, order: i })
    }
  }

  return updates
}

/** Вычисляет обновления для DnD-переупорядочивания. См. docs/task-reordering.md */
export function computeReorder(
  allTasks: Task[],
  movedTaskId: string,
  newDueDate: string | null,
  dropPosition: number,
): ReorderUpdate[] {
  const movedTask = allTasks.find((t) => t.id === movedTaskId)

  if (!movedTask) return []
  if (!Number.isInteger(dropPosition) || dropPosition < 0) return []

  const oldDueDate = movedTask.dueDate
  const oldOrder = movedTask.order

  if (newDueDate === null) {
    if (oldDueDate === null) return []

    const sourceList = tasksByDay(allTasks, oldDueDate).filter((t) => t.id !== movedTaskId)
    const updates = diffOrders(sourceList)

    updates.push({ id: movedTaskId, dueDate: null, order: null })

    return updates
  }

  const sameDate = oldDueDate === newDueDate

  const normalizedPosition =
    sameDate && oldOrder !== null && dropPosition > oldOrder ? dropPosition - 1 : dropPosition

  if (sameDate && oldOrder === normalizedPosition) return []

  const targetList = tasksByDay(allTasks, newDueDate).filter((t) => t.id !== movedTaskId)

  if (normalizedPosition > targetList.length) return []

  targetList.splice(normalizedPosition, 0, movedTask)

  const updates = diffOrders(targetList)

  if (!sameDate && oldDueDate !== null) {
    const sourceList = tasksByDay(allTasks, oldDueDate).filter((t) => t.id !== movedTaskId)

    updates.push(...diffOrders(sourceList))
  }

  const movedUpdate = updates.find((u) => u.id === movedTaskId)

  if (movedUpdate) {
    movedUpdate.dueDate = newDueDate
  } else {
    updates.push({ id: movedTaskId, dueDate: newDueDate, order: normalizedPosition })
  }

  return updates
}
