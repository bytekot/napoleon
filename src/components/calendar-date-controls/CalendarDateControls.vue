<script setup lang="ts">
import { useCalendarStore } from '../../stores/calendar'
import Button from '../button/Button.vue'
import CaretLeft from '../icon/CaretLeft.vue'
import CaretRight from '../icon/CaretRight.vue'

const store = useCalendarStore()
</script>

<template>
  <div class="calendar-date-controls">
    <Button @click="store.setPreviousDate()">
      <CaretLeft size="small" />
    </Button>
    <Button @click="store.setToday()">Сегодня</Button>
    <Button @click="store.setNextDate()">
      <CaretRight size="small" />
    </Button>
  </div>
</template>

<style scoped lang="scss">
.calendar-date-controls {
  background: var(--color-bg-controls);
  padding: var(--space-controls);

  button {
    margin-right: var(--space-controls-gap);
  }
}
</style>
