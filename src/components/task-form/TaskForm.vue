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
  const isSubmit = event.key === 'Enter' && (event.ctrlKey || event.metaKey)

  if (isSubmit && taskName.value.trim()) {
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
        hint="Ctrl+Enter ↵"
        auto-focus
        :resize="'none'"
        class="task-input"
        @keydown="onInputKeydown"
      />
      <TaskList :due-date="null" empty-text="Список пуст." class="tasks" />
    </template>
  </div>
</template>

<style scoped lang="scss">
.task-form {
  background: var(--color-bg-sidebar);
  box-shadow: var(--shadow-card);
  width: var(--size-sidebar);
  display: flex;
  flex-direction: column;

  .header {
    border: 1px solid var(--color-border-default);
    flex-shrink: 0;
    min-height: var(--size-header-height);
    padding: var(--space-header-padding-y) 0;
    box-sizing: border-box;
    display: flex;
    align-items: center;

    h1 {
      font-size: var(--font-size-heading);
      font-weight: var(--font-weight-heading);
      letter-spacing: var(--letter-spacing-heading);
      color: var(--color-text-secondary);
      padding-left: var(--space-header-title-x);
    }

    button {
      margin: 0px 0px 0px 10px;
      padding: 0 5px;
      border-radius: var(--radius-form-toggle);
      box-shadow: var(--button-shadow), var(--shadow-card);
      opacity: 0.99;

      svg {
        height: var(--size-form-toggle-icon);
        width: var(--size-form-toggle-icon);
      }
    }
  }

  .tasks {
    flex: 1;
    min-height: 0;
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

  .task-input {
    margin: var(--space-form-input);
    flex-shrink: 0;
  }
}
</style>
