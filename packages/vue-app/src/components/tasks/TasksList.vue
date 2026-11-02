<script setup lang="ts">
import { computed } from 'vue'
import { useTasksStore } from '../../stores/tasks'
import TaskItem from '../task/TaskItem.vue'

const props = withDefaults(
  defineProps<{
    dueDate: string | null
    emptyText?: string
  }>(),
  {
    emptyText: 'Список пуст.',
  },
)

defineEmits<{
  itemDragStart: [id: string, event: DragEvent]
}>()

const store = useTasksStore()

const taskIds = computed(() => {
  if (props.dueDate === null) {
    return store.unplannedTaskIds
  }
  return store.taskIdsByDueDate(props.dueDate)
})

const isLoading = computed(() => store.request.status === 'pending')
</script>

<template>
  <div class="tasks">
    <div v-if="isLoading" class="loading">Загрузка...</div>
    <div v-else-if="taskIds.length === 0" class="empty-text">{{ emptyText }}</div>
    <div data-tasks class="container">
      <TaskItem v-for="taskId in taskIds" :key="taskId" :task-id="taskId" />
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

  .container {
    flex: 1;
    overflow: hidden;

    div {
      margin-bottom: 10px;
    }
  }
}
</style>
