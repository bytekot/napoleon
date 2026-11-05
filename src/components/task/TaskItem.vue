<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore } from '../../stores/task'
import { useCalendarStore } from '../../stores/calendar'

const props = defineProps<{
  taskId: string
  mini?: boolean
}>()

const store = useTaskStore()
const calendarStore = useCalendarStore()

const task = computed(() => store.taskById(props.taskId))

const now = new Date()

now.setHours(0, 0, 0, 0)

const isOverdue = computed(() => {
  if (!task.value) return false

  return !task.value.completed && task.value.dueDate !== null && new Date(task.value.dueDate) < now
})

const isDragged = computed(() => calendarStore.movingItemId === props.taskId)

function onCheckChange(event: Event) {
  if (!task.value) return
  const target = event.target as HTMLInputElement

  void store.editTask({ id: props.taskId, completed: target.checked })
}

function onDragStart(event: DragEvent) {
  if (!task.value) return
  calendarStore.setMovingItemId(null)
  const target = event.currentTarget as HTMLElement

  event.dataTransfer!.effectAllowed = 'move'
  event.dataTransfer!.setData('text/plain', props.taskId)
  calendarStore.setMovingItemId(props.taskId)
  target.addEventListener('dragend', () => calendarStore.setMovingItemId(null), { once: true })
}
</script>

<template>
  <!-- data-task: точка приложения внешних классов (border-top, border-bottom) из TaskList -->
  <div data-task>
    <div
      v-if="task"
      class="task"
      :class="{ completed: task.completed, overdue: isOverdue, dragged: isDragged, mini }"
      :draggable="!task.completed"
      @dragstart="onDragStart"
    >
      <span class="style" />
      <span>
        <label>
          <input type="checkbox" :checked="task.completed" @change="onCheckChange" />
          <span class="checkmark" />
          <span class="text">{{ task.name }}</span>
        </label>
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

  label {
    display: block;
    position: relative;
    cursor: pointer;

    input {
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
    }

    .text {
      margin-left: var(--space-checkmark-text);
    }

    &:hover {
      input {
        ~ .checkmark {
          background-color: var(--color-bg-checkmark-hover);
        }
      }
    }
  }

  label input:checked ~ .checkmark {
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

  label input:checked ~ .checkmark:after {
    display: block;
  }

  label .checkmark:after {
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

  &:hover {
    background-color: var(--color-bg-card-hover);
    box-shadow: var(--shadow-card-hover);
  }

  &.dragged {
    opacity: 0.5;
  }

  &.completed {
    background: none;
    box-shadow: var(--shadow-card-completed);
    cursor: default;
    transition: var(--transition-card-completed);

    label {
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

    label input:checked ~ .text {
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
