<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore } from '../../stores/task'
import { useTrackTask } from '../../composables/useTrackTask'
import TaskItem from '../task/TaskItem.vue'
import Plus from '../icon/Plus.vue'

const props = defineProps<{
  dueDate: string | null
  emptyText?: string
  mini?: boolean
}>()

const store = useTaskStore()
const { position, track } = useTrackTask()

const taskIds = computed(() => {
  if (props.dueDate === null) {
    return store.unplannedTaskIds
  }

  return store.taskIdsByDueDate(props.dueDate)
})

const isLoading = computed(() => store.request.status === 'pending')

const showAddIcon = computed(() => position.value !== null && taskIds.value.length === 0)

function onDragOver(event: DragEvent) {
  event.preventDefault()
  track(event.target as Element, event.clientY)
}

function onDragLeave(event: DragEvent) {
  const root = event.currentTarget as HTMLElement

  if (event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) return
  track(null)
}

function onDrop(event: DragEvent) {
  const id = event.dataTransfer?.getData('text/plain')

  if (!id || position.value === null) return
  void store.reorderTask(id, props.dueDate, position.value)
  track(null)
}
</script>

<template>
  <div class="task-list" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
    <div v-if="isLoading" class="loading">Загрузка...</div>
    <div v-else-if="showAddIcon" class="add-task"><Plus size="medium" /></div>
    <div v-else-if="taskIds.length === 0 && emptyText" class="empty-text">{{ emptyText }}</div>
    <div data-task-list class="container">
      <TaskItem
        v-for="(taskId, index) in taskIds"
        :key="taskId"
        :task-id="taskId"
        :mini="mini"
        :class="{ 'border-top': index === position, 'border-bottom': index + 1 === position }"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.task-list {
  display: flex;
  flex-direction: column;
  padding: var(--space-list);
  overflow: hidden;

  .empty-text,
  .loading {
    color: var(--color-text-secondary);
  }

  .add-task {
    fill: var(--color-icon-muted);
    margin: 0 auto;
  }

  .container {
    flex: 1;
    overflow: hidden;

    div {
      margin-bottom: var(--space-list-item-gap);
    }

    div.border-top,
    div.border-bottom {
      transition: var(--transition-drag-indicator);
    }

    div.border-top {
      box-shadow: var(--shadow-drag-top);
    }

    div.border-bottom {
      box-shadow: var(--shadow-drag-bottom);
    }
  }
}
</style>
