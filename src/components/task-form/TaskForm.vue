<script setup lang="ts">
import { ref } from 'vue'
import { useTaskStore } from '../../stores/task'
import TaskList from '../tasks/TaskList.vue'
import Button from '../button/Button.vue'
import TextArea from '../text-area/TextArea.vue'
import TasksIcon from '../icon/Tasks.vue'

const store = useTaskStore()

const taskName = ref('')
const minimized = ref(false)

function onInputKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && taskName.value.trim()) {
    void store.createTask({
      name: taskName.value,
      creationDate: new Date().toISOString(),
    })
    taskName.value = ''
  }
}

function toggleMinimized() {
  minimized.value = !minimized.value
}
</script>

<template>
  <div class="task-form" :class="{ minimized }">
    <div class="header">
      <Button @click="toggleMinimized">
        <TasksIcon size="small" />
      </Button>
      <h1 v-if="!minimized">Список дел</h1>
    </div>
    <template v-if="!minimized">
      <TextArea
        v-model="taskName"
        placeholder="Что нужно сделать?"
        auto-focus
        @keydown="onInputKeydown"
      />
      <TaskList :due-date="null" empty-text="Список пуст." />
    </template>
  </div>
</template>

<style scoped lang="scss">
.task-form {
  background: var(--color-bg-sidebar);
  box-shadow: var(--shadow-card);
  width: var(--size-sidebar);

  .header {
    border: 1px solid var(--color-border-default);

    h1 {
      display: inline-block;
      padding: var(--space-form-header);
      color: var(--color-text-secondary);
    }

    button {
      margin: 0px 0px 0px var(--space-10);
      line-height: var(--line-height-form-toggle);
      padding: 0 var(--space-5);
      border-radius: var(--radius-form-toggle);
      box-shadow: var(--button-shadow), var(--shadow-card);
      opacity: 0.99;

      svg {
        height: var(--size-form-toggle-icon);
        width: var(--size-form-toggle-icon);
        padding-bottom: var(--space-form-icon-offset);
      }
    }
  }

  &.minimized {
    width: var(--size-sidebar-minimized);
    transition: var(--transition-sidebar);

    .header {
      border-color: transparent;

      button {
        margin-top: var(--space-form-toggle-minimized);
      }
    }
  }

  input {
    height: var(--size-input-height);
    width: var(--size-input-width);
    margin: var(--space-form-input);
  }
}
</style>
