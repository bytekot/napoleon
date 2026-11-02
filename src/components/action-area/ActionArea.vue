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
  background: #e1e1e1;
  color: #f5f5f5;
  font-size: 32px;
  text-align: center;
  padding: 4px 20px;

  :deep(svg) {
    fill: #d5d5d5;
  }

  &.dangerous {
    background: rgba(255, 0, 0, 0.2);
  }

  &.active {
    background-color: #d5d5d5;
    transition: 0.1s all ease;

    &.dangerous {
      background: rgba(255, 0, 0, 0.4);
    }
  }
}
</style>
