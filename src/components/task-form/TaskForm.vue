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
  background: #e5e5e5;
  box-shadow: 0 2px 1px -1px rgba(black, 0.2);
  width: 300px;

  .header {
    border: 1px solid rgb(221, 221, 221);

    h1 {
      display: inline-block;
      padding: 12.5px 8px;
      color: #999;
    }

    button {
      margin: 0px 0px 0px 10px;
      line-height: 35px;
      padding: 0 5px;
      border-radius: 30px;
      box-shadow:
        rgba(255, 255, 255, 0.6) 0 1px 0 inset,
        0 2px 1px -1px rgba(black, 0.2);
      opacity: 0.99;

      svg {
        height: 20px;
        width: 20px;
        padding-bottom: 10px;
      }
    }
  }

  &.minimized {
    width: 30px;
    transition: 0.2s all ease-in;

    .header {
      border-color: transparent;

      button {
        margin-top: 8px;
      }
    }
  }

  input {
    height: 15px;
    width: 210px;
    margin: 10px;
  }
}
</style>
