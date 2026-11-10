import { computed, type Ref, toValue, type MaybeRefOrGetter } from 'vue'
import { makeSortableList, makeSortableItem } from '@vue-dnd-kit/core'
import { useTaskStore } from '../../stores/task'
import type { Task } from '../../types/tasks'

export function useSortableTaskList(
  listRef: Ref<HTMLElement | null>,
  options: { dueDate: string | null; taskIds: () => readonly string[] },
) {
  const store = useTaskStore()

  const tasks = computed(
    () =>
      options
        .taskIds()
        .map((id) => store.taskById(id))
        .filter(Boolean) as Task[],
  )

  const { items, isOver } = makeSortableList(listRef, {
    id: options.dueDate ?? 'unplanned',
    group: 'tasks',
    items: tasks,
    sort: options.dueDate !== null,
    onDrop: (e) => {
      e.preventDefault()

      const taskId = e.keys[0] as string
      const targetList = e.result.get(e.to.list)

      if (!targetList) return

      const newIndex = targetList.findIndex((t) => t.id === taskId)

      if (newIndex === -1) return

      void store.reorderTask(taskId, options.dueDate, newIndex)
    },
  })

  return { items, isOver }
}

export function useSortableTaskItem(
  elRef: Ref<HTMLElement | null>,
  options: { task: MaybeRefOrGetter<Task> },
) {
  const { isDragging, isPlaceholder, selected } = makeSortableItem(elRef, {
    item: () => toValue(options.task),
    disabled: () => toValue(options.task).completed,
  })

  return { isDragging, isPlaceholder, selected }
}
