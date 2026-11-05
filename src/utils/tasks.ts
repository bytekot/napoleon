import type { Task } from '../types/tasks'

export interface ReorderUpdate {
  id: string
  order: number | null
  dueDate?: string | null
}

/**
 * Вычисляет минимальный набор обновлений задач при drag-and-drop.
 *
 * Контракт позиции: `dropPosition` — DOM-индекс точки вставки (0..N),
 * как возвращает `getDraggedTaskOrder`. При перемещении внутри дня
 * перетаскиваемая карта остаётся в списке, поэтому `dropPosition > oldOrder`
 * нормализуется на −1 (семантика «удалить, затем вставить»).
 *
 * Пустой результат означает no-op или невалидные входные данные —
 * запрос на сервер отправлять не нужно.
 */
export function computeReorderDelta(
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

    const updates: ReorderUpdate[] = [{ id: movedTaskId, dueDate: null, order: null }]

    for (const task of allTasks) {
      if (task.id === movedTaskId) continue
      if (task.dueDate !== oldDueDate || task.order === null) continue

      if (task.order > (oldOrder ?? -1)) {
        updates.push({ id: task.id, order: task.order - 1 })
      }
    }

    return updates
  }

  const sameDate = oldDueDate === newDueDate

  const newPosition =
    sameDate && oldOrder !== null && dropPosition > oldOrder ? dropPosition - 1 : dropPosition

  if (sameDate && oldOrder === newPosition) return []

  const dayTasks = allTasks.filter(
    (t) => t.dueDate === newDueDate && t.order !== null && t.id !== movedTaskId,
  )

  if (newPosition > dayTasks.length) return []

  const updates: ReorderUpdate[] = []

  if (sameDate) {
    for (const task of dayTasks) {
      const order = task.order!

      if (oldOrder === null) {
        if (order >= newPosition) {
          updates.push({ id: task.id, order: order + 1 })
        }
      } else if (oldOrder < newPosition) {
        if (order > oldOrder && order <= newPosition) {
          updates.push({ id: task.id, order: order - 1 })
        }
      } else {
        if (order >= newPosition && order < oldOrder) {
          updates.push({ id: task.id, order: order + 1 })
        }
      }
    }
  } else {
    if (oldDueDate !== null && oldOrder !== null) {
      for (const task of allTasks) {
        if (task.id === movedTaskId) continue
        if (task.dueDate !== oldDueDate || task.order === null) continue

        if (task.order > oldOrder) {
          updates.push({ id: task.id, order: task.order - 1 })
        }
      }
    }

    for (const task of dayTasks) {
      if (task.order! >= newPosition) {
        updates.push({ id: task.id, order: task.order! + 1 })
      }
    }
  }

  updates.push({ id: movedTaskId, dueDate: newDueDate, order: newPosition })

  return updates
}

/**
 * Вычисляет минимальный набор обновлений задач при drag-and-drop.
 * Алгоритм: строит желаемое состояние дня, перенумеровывает 0..N-1,
 * диффит с текущим состоянием. Аномалии (dueDate != null, order == null)
 * чинятся автоматически при перенумерации.
 *
 * Контракт позиции: `dropPosition` — DOM-индекс точки вставки (0..N),
 * как возвращает `getDraggedTaskOrder`. При перемещении внутри дня
 * перетаскиваемая карта остаётся в списке, поэтому `dropPosition > oldOrder`
 * нормализуется на −1 (семантика «удалить, затем вставить»).
 *
 * Пустой результат означает no-op или невалидные входные данные —
 * запрос на сервер отправлять не нужно.
 */
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

  const targetList = tasksByDay(allTasks, newDueDate).filter((t) => t.id !== movedTaskId)

  if (normalizedPosition > targetList.length) return []

  targetList.splice(normalizedPosition, 0, movedTask)

  const updates = diffOrders(targetList)

  if (!sameDate && oldDueDate !== null) {
    const sourceList = tasksByDay(allTasks, oldDueDate).filter((t) => t.id !== movedTaskId)

    for (const update of diffOrders(sourceList)) {
      if (!updates.some((u) => u.id === update.id)) {
        updates.push(update)
      }
    }
  }

  if (sameDate && updates.length === 0) return []

  const movedUpdate = updates.find((u) => u.id === movedTaskId)

  if (movedUpdate) {
    movedUpdate.dueDate = newDueDate
  } else {
    updates.push({ id: movedTaskId, dueDate: newDueDate, order: normalizedPosition })
  }

  return updates
}

function tasksByDay(allTasks: Task[], dueDate: string): Task[] {
  return allTasks
    .filter((t) => t.dueDate === dueDate && t.id !== undefined)
    .sort((a, b) => (a.order ?? -1) - (b.order ?? -1))
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
