<script setup lang="ts">
import { computed } from 'vue'
import { useTasksStore } from '../../stores/tasks'
import { useCalendarStore } from '../../stores/calendar'

const props = defineProps<{
  taskId: string
  mini?: boolean
}>()

const store = useTasksStore()
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
  <!-- data-task: точка приложения внешних классов (border-top, border-bottom) из TasksList -->
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
  padding: 20px;
  position: relative;
  background: #fff;
  color: #999;
  box-shadow: 0 2px 1px -1px rgba(black, 0.2);
  border-radius: 10px;
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
      height: 20px;
      width: 20px;
      padding: 0;
      background-color: #fff;
      box-shadow: inset 0 0 0 1px #ccc;
      border-radius: 30px;
    }

    .text {
      margin-left: 30px;
    }

    &:hover {
      input {
        ~ .checkmark {
          background-color: #f9f9f9;
        }
      }
    }
  }

  label input:checked ~ .checkmark {
    background-color: #eee;
    box-shadow: inset 0 0 0 1px #ccc;
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
    border: solid #ccc;
    border-width: 0 1px 1px 0;
    transform: rotate(45deg);
  }

  .style {
    width: 10px;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.93);
    box-shadow: 0 2px 1px 0px rgba(black, 0.2);
  }

  &.dragged {
    opacity: 0.5;
  }

  &.completed {
    background: none;
    box-shadow:
      inset 1px 1px 0 0 #ddd,
      inset -1px -1px 0 0 #ddd;
    cursor: default;
    transition: 0.1s all ease-in;

    label {
      cursor: default;
    }
  }

  &.overdue {
    .style {
      background: rgba(255, 0, 0, 0.2);
    }

    .warning {
      padding-right: 5px;
    }

    label input:checked ~ .text {
      opacity: 0.1;
    }
  }

  &.mini {
    padding: 3px 15px 5px;
    max-height: 30px;
    max-width: 170px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>
