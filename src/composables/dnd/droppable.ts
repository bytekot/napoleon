import { type Ref, type MaybeRefOrGetter } from 'vue'
import { makeDroppable } from '@vue-dnd-kit/core'

export function useDropZone(
  elRef: Ref<HTMLElement | null>,
  options: {
    id: string
    accept?: string
    disabled?: MaybeRefOrGetter<boolean>
    onDragEnter?: () => void
    onDrop?: (taskId: string) => void
  },
) {
  const { isOver } = makeDroppable(elRef, {
    id: options.id,
    accept: options.accept ?? '*',
    disabled: options.disabled ?? false,
    onDragEnter: options.onDragEnter ? () => options.onDragEnter!() : undefined,
    onDrop: (e) => {
      if (!options.onDrop) return

      const taskId = e.active?.ids?.[0] as string | undefined

      if (taskId) {
        options.onDrop(taskId)
      }
    },
  })

  return { isOver }
}
