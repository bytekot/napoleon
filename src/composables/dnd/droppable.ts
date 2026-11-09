import { type Ref } from 'vue'
import { makeDroppable } from '@vue-dnd-kit/core'

export function useDropZone(
  elRef: Ref<HTMLElement | null>,
  options: { id: string; accept?: string; onDrop?: (taskId: string) => void },
) {
  const { isOver } = makeDroppable(elRef, {
    id: options.id,
    accept: options.accept ?? 'task',
    onDrop: (e) => {
      if (options.onDrop && e.active?.id) {
        options.onDrop(e.active.id as string)
      }
    },
  })

  return { isOver }
}
