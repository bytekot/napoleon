<script setup lang="ts">
import { ref } from 'vue'

withDefaults(
  defineProps<{
    dangerous?: boolean
  }>(),
  {
    dangerous: false,
  },
)

defineSlots<{
  default(): unknown
}>()

const emit = defineEmits<{
  enter: [event: DragEvent]
  leave: [event: DragEvent]
  drop: [event: DragEvent]
}>()

const hovered = ref(false)

function onDragEnter(event: DragEvent) {
  if (hovered.value) return

  hovered.value = true
  emit('enter', event)
}

function onDragLeave(event: DragEvent) {
  const root = event.currentTarget as HTMLElement

  if (event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) return

  hovered.value = false
  emit('leave', event)
}

function onDrop(event: DragEvent) {
  hovered.value = false
  emit('drop', event)
}
</script>

<template>
  <div
    class="action-area"
    :class="{ dangerous, active: hovered }"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @dragover.prevent
    @drop="onDrop"
  >
    <slot />
  </div>
</template>

<style scoped lang="scss">
.action-area {
  background: var(--color-bg-action-area);
  color: var(--color-text-action-area);
  font-size: var(--font-size-action-area);
  text-align: center;
  padding: var(--space-action-area);

  :deep(svg) {
    fill: var(--color-icon-muted);
  }

  &.dangerous {
    background: var(--color-bg-danger);
  }

  &.active {
    background-color: var(--color-bg-action-area-active);
    transition: var(--transition-action-area);

    &.dangerous {
      background: var(--color-bg-danger-active);
    }
  }
}
</style>
