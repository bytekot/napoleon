<script setup lang="ts">
import { onMounted } from 'vue'
import Layout from '../components/layout/Layout.vue'
import TaskForm from '../components/task-form/TaskForm.vue'
import Calendar from '../components/calendar/Calendar.vue'
import { useTaskStore } from '../stores/task'
import { DndScope } from '../composables/dnd'

const store = useTaskStore()

onMounted(() => {
  void store.fetchTasks()
})
</script>

<template>
  <Layout>
    <DndScope>
      <div class="main-page">
        <TaskForm class="task-form" />
        <Calendar class="calendar" />
      </div>
    </DndScope>
  </Layout>
</template>

<style scoped lang="scss">
.main-page {
  height: 100%;
  display: flex;

  .task-form {
    max-width: var(--size-sidebar-max);
    height: 100%;
  }

  .calendar {
    flex: 1;
  }
}
</style>
