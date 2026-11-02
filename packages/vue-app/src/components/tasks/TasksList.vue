<script setup lang="ts">
import { computed } from 'vue'
import { useTasksStore } from '../../stores/tasks'
import { useTrackTask } from '../../composables/useTrackTask'
import TaskItem from '../task/TaskItem.vue'
import Plus from '../icon/Plus.vue'

const props = withDefaults(
  defineProps<{
    dueDate: string | null
    emptyText?: string
    mini?: boolean
  }>(),
  {
    emptyText: 'Список пуст.',
  },
)

const store = useTasksStore()
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
  void store.editTask({ id, dueDate: props.dueDate, order: position.value })
  track(null)
}
</script>

<template>
  <div class="tasks" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
    <div v-if="isLoading" class="loading">Загрузка...</div>
    <div v-else-if="showAddIcon" class="add-task"><Plus size="medium" /></div>
    <div v-else-if="taskIds.length === 0" class="empty-text">{{ emptyText }}</div>
    <div data-tasks class="container">
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
.tasks {
  display: flex;
  flex-direction: column;
  padding: 10px;
  overflow: hidden;

  .empty-text,
  .loading {
    color: #999;
  }

  .add-task {
    fill: #d5d5d5;
    margin: 0 auto;
  }

  .container {
    flex: 1;
    overflow: hidden;

    div {
      margin-bottom: 10px;
    }

    div.border-top,
    div.border-bottom {
      transition: 0.2s all ease-in-out;
    }

    div.border-top {
      box-shadow:
        0 -2px 1px 0 #b3d4ff,
        0 2px 1px -1px rgba(black, 0.2);
    }

    div.border-bottom {
      box-shadow: 0 2px 1px 0 #b3d4ff;
    }
  }
}
</style>
