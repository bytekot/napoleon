import type { Task } from '../types/tasks'

export interface ReorderUpdate {
  id: string
  order: number | null
  dueDate?: string | null
}

/**
 * Вычисляет обновления order для списка задач после переупорядочивания.
 * Возвращает только задачи, у которых order изменился.
 */
export function diffOrders(sortedList: Task[]): ReorderUpdate[] {
  const updates: ReorderUpdate[] = []

  for (let i = 0; i < sortedList.length; i++) {
    const task = sortedList[i]!

    if (task.order !== i) {
      updates.push({ id: task.id, order: i })
    }
  }

  return updates
}

export interface DropEventResult {
  keys: readonly unknown[]
  from: { list: unknown }
  to: { list: unknown }
  result: ReadonlyMap<unknown, Task[]>
}

/**
 * Формирует ReorderUpdate[] из события drop библиотеки @vue-dnd-kit/core.
 */
export function buildReorderUpdates(
  e: DropEventResult,
  targetDueDate: string | null,
): ReorderUpdate[] {
  const movedTaskId = e.keys[0] as string
  const isCrossDay = e.from.list !== e.to.list
  const updates: ReorderUpdate[] = []

  for (const [listId, newList] of e.result) {
    if (listId === 'unplanned') continue

    updates.push(...diffOrders(newList))
  }

  if (!isCrossDay) return updates

  const movedIndex = updates.findIndex((u) => u.id === movedTaskId)

  if (movedIndex !== -1) {
    const moved = updates[movedIndex]!
    const updated: ReorderUpdate = { ...moved, dueDate: targetDueDate }

    if (targetDueDate === null) {
      updated.order = null
    }

    updates[movedIndex] = updated
  } else {
    const targetList = e.result.get(e.to.list)
    const newIndex = targetList?.findIndex((t) => t.id === movedTaskId) ?? -1

    if (newIndex !== -1) {
      updates.push({
        id: movedTaskId,
        order: targetDueDate === null ? null : newIndex,
        dueDate: targetDueDate,
      })
    }
  }

  return updates
}
