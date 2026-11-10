<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { useDropZone } from '../../composables/dnd'

const props = withDefaults(
  defineProps<{
    id?: string
    dangerous?: boolean
  }>(),
  {
    id: undefined,
    dangerous: false,
  },
)

defineSlots<{
  default(): unknown
}>()

const emit = defineEmits<{
  enter: []
  drop: [taskId: string]
}>()

const el = useTemplateRef<HTMLElement>('el')

const isDropMode = computed(() => !!props.id)

const { isOver } = useDropZone(el, {
  id: props.id ?? 'action-area-hover',
  accept: '*',
  onDragEnter: () => {
    if (!isDropMode.value) {
      emit('enter')
    }
  },
  onDrop: (taskId) => {
    if (isDropMode.value) {
      emit('drop', taskId)
    }
  },
})

const active = computed(() => isOver.value)
</script>

<template>
  <div ref="el" class="action-area" :class="{ dangerous, active }">
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
