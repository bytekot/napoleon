<script setup lang="ts">
import { onMounted } from 'vue'
import Layout from '../components/layout/Layout.vue'
import TasksForm from '../components/tasks-form/TasksForm.vue'
import { useTasksStore } from '../stores/tasks'
// Calendar будет добавлен на Этапе 7

const store = useTasksStore()

onMounted(() => {
  void store.fetchTasks()
})
</script>

<template>
  <Layout>
    <div class="main-page">
      <TasksForm class="tasks" />
    </div>
  </Layout>
</template>

<style scoped lang="scss">
.main-page {
  height: 100%;
  display: flex;

  .tasks {
    max-width: 250px;
  }
}
</style>
