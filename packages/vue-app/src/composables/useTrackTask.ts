import { ref } from 'vue'
import { getDraggedTaskOrder } from '../utils/tasks'

/**
 * Отслеживание позиции курсора внутри drop-зоны.
 * ВАЖНО: position — per-instance ref. НЕ выносить в модульный singleton.
 */
export function useTrackTask() {
  const position = ref<number | null>(null)

  function track(target: Element | null, clientY?: number) {
    if (!target || clientY === undefined) {
      position.value = null
      return
    }
    position.value = getDraggedTaskOrder(target, clientY)
  }

  return { position, track }
}
