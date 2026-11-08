<script setup lang="ts">
import { computed } from 'vue'
import CalendarDay from '../calendar-day/CalendarDay.vue'
import TaskList from '../tasks/TaskList.vue'
import { getWeekDayDates, formatDateISO } from '../../utils/calendar'

const props = defineProps<{
  date: Date
}>()

const weekDates = computed(() => getWeekDayDates(props.date))
</script>

<template>
  <time class="calendar-week">
    <CalendarDay v-for="(dayDate, index) in weekDates" :key="index" :date="dayDate" class="day">
      <TaskList :due-date="formatDateISO(dayDate)" class="tasks" />
    </CalendarDay>
  </time>
</template>

<style scoped lang="scss">
.calendar-week {
  display: flex;
  border-top: 1px solid var(--color-border-default);

  .day {
    flex: 1;
    min-width: 0;
    border-right: 1px solid var(--color-border-default);

    .tasks {
      flex: 1;
    }
  }
}
</style>
