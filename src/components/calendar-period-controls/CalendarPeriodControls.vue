<script setup lang="ts">
import { useCalendarStore } from '../../stores/calendar'
import { CALENDAR_PERIODS } from '../../constants/calendar'
import Button from '../button/Button.vue'

const store = useCalendarStore()
</script>

<template>
  <div class="calendar-period-controls">
    <Button @click="store.setPeriod(CALENDAR_PERIODS.week)">Неделя</Button>
    <Button @click="store.setPeriod(CALENDAR_PERIODS.month)">Месяц</Button>
    <Button @click="store.setPeriod(CALENDAR_PERIODS.year)">Год</Button>
  </div>
</template>

<style scoped lang="scss">
.calendar-period-controls {
  background: var(--color-bg-controls);
  padding: var(--space-controls);

  button {
    border-radius: 0;
    width: var(--size-period-button);

    &:first-child {
      border-width: 1px 0 1px 1px;
      border-radius: var(--radius-button-group-first);
    }

    &:last-child {
      border-width: 1px 1px 1px 0;
      border-radius: var(--radius-button-group-last);
    }
  }
}
</style>
