import { computed } from 'vue'
import { useDnD } from '@vue-dnd-kit/core'

export function useDndStatus() {
  const { status, active } = useDnD()

  const isDragging = computed(() => status.value === 'dragging')
  const activeId = computed(() => active.value?.id ?? null)

  return { isDragging, activeId }
}
