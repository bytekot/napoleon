<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { useTaskStore } from '../../stores/task'
import { useSortableTaskItem } from '../../composables/dnd'
import type { Task } from '../../types/tasks'

const props = defineProps<{
  task: Task
  mini?: boolean
}>()

const store = useTaskStore()

const el = useTemplateRef<HTMLElement>('el')
const { isPlaceholder } = useSortableTaskItem(el, { task: () => props.task })

const now = new Date()

now.setHours(0, 0, 0, 0)

const isOverdue = computed(() => {
  return !props.task.completed && props.task.dueDate !== null && new Date(props.task.dueDate) < now
})

function onCheckChange() {
  void store.editTask({ id: props.task.id, completed: !props.task.completed })
}

function onInputKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    onCheckChange()
  }
}
</script>

<template>
  <div ref="el" data-task :data-task-id="task.id" @click="onCheckChange">
    <div
      class="task"
      :class="{ completed: task.completed, overdue: isOverdue, dragged: isPlaceholder, mini }"
    >
      <span class="style" />
      <span>
        <input
          type="checkbox"
          :checked="task.completed"
          :aria-label="task.name"
          @click.stop
          @keydown.stop="onInputKeydown"
        />
        <span class="checkmark" />
        <span class="text">{{ task.name }}</span>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.task {
  padding: var(--space-card);
  position: relative;
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  box-shadow: var(--shadow-card);
  border-radius: var(--radius-card);
  overflow: hidden;
  cursor: pointer;

  input[type='checkbox'] {
    position: absolute;
    opacity: 0;
    height: 0;
    width: 0;
    cursor: pointer;
  }

  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: var(--size-checkmark);
    width: var(--size-checkmark);
    padding: 0;
    background-color: var(--color-bg-checkmark);
    box-shadow: var(--shadow-checkmark);
    border-radius: var(--radius-checkmark);
    cursor: pointer;
  }

  .text {
    margin-left: var(--space-checkmark-text);
  }

  &:hover {
    background-color: var(--color-bg-card-hover);
    box-shadow: var(--shadow-card-hover);

    input[type='checkbox'] ~ .checkmark {
      background-color: var(--color-bg-checkmark-hover);
    }
  }

  input[type='checkbox']:checked ~ .checkmark {
    background-color: var(--color-bg-checkmark-checked);
    box-shadow: var(--shadow-checkmark);
    opacity: 0.8;

    ~ .text {
      opacity: 0.3;
    }
  }

  .checkmark:after {
    content: '';
    position: absolute;
    display: none;
  }

  input[type='checkbox']:checked ~ .checkmark:after {
    display: block;
  }

  .checkmark:after {
    left: 8px;
    top: 4px;
    width: 5px;
    height: 10px;
    border: solid var(--color-border-checkmark);
    border-width: 0 1px 1px 0;
    transform: rotate(45deg);
  }

  .style {
    width: var(--size-overdue-stripe);
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
  }

  &.dragged {
    opacity: 0.5;
  }

  &.completed {
    background: none;
    box-shadow: var(--shadow-card-completed);
    cursor: default;
    transition: var(--transition-card-completed);

    .checkmark {
      cursor: default;
    }
  }

  &.overdue {
    .style {
      background: var(--color-bg-danger);
    }

    .warning {
      padding-right: var(--space-overdue-warning);
    }

    input[type='checkbox']:checked ~ .text {
      opacity: 0.1;
    }
  }

  &.mini {
    padding: var(--space-card-mini);
    max-height: var(--size-mini-task-height);
    max-width: var(--size-mini-task-width);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>
