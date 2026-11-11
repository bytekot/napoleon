<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { useTaskStore } from '../../stores/task'
import { useSortableTaskList } from '../../composables/dnd'
import TaskItem from '../task/TaskItem.vue'
const props = defineProps<{
  dueDate: string | null
  emptyText?: string
  mini?: boolean
}>()

const store = useTaskStore()

const taskIds = computed(() => {
  if (props.dueDate === null) {
    return store.unplannedTaskIds
  }

  return store.taskIdsByDueDate(props.dueDate)
})

const listRef = useTemplateRef<HTMLElement>('list')
const { items } = useSortableTaskList(listRef, {
  dueDate: props.dueDate,
  taskIds: () => taskIds.value,
})

const isLoading = computed(() => store.request.status === 'pending')
</script>

<template>
  <div class="task-list" :data-due-date="dueDate ?? 'unplanned'">
    <div v-if="isLoading" class="loading">Загрузка...</div>
    <div v-else-if="taskIds.length === 0 && emptyText" class="empty-text">{{ emptyText }}</div>
    <ul ref="list" data-task-list class="container">
      <li v-for="task in items" :key="task.id">
        <TaskItem :task="task" :mini="mini" />
      </li>
    </ul>
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

  .container {
    flex: 1;
    overflow: hidden;
    list-style: none;
    padding: 0;
    margin: 0;

    > li {
      margin-bottom: var(--space-list-item-gap);
    }
  }
}
</style>
