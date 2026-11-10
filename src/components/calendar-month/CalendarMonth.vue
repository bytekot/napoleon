<script setup lang="ts">
import { computed } from 'vue'
import CalendarDay from '../calendar-day/CalendarDay.vue'
import TaskList from '../tasks/TaskList.vue'
import { getCalendarMonthDates, getMonth, formatDateISO } from '../../utils/calendar'
import { DAYS_OF_WEEK } from '../../constants/calendar'

const props = withDefaults(
  defineProps<{
    date: Date
    minimized?: boolean
  }>(),
  {
    minimized: false,
  },
)

const monthDates = computed(() => getCalendarMonthDates(props.date))
const dateTime = computed(() => getMonth(props.date))
</script>

<template>
  <time :datetime="dateTime" class="calendar-month" :class="{ minimized }">
    <div v-for="(day, index) in DAYS_OF_WEEK" :key="index" class="day-of-week">
      {{ day }}
    </div>
    <CalendarDay
      v-for="dayDate in monthDates"
      :key="formatDateISO(dayDate)"
      :date="dayDate"
      :minimized="minimized"
      class="day"
    >
      <TaskList :due-date="formatDateISO(dayDate)" :mini="true" class="tasks" />
    </CalendarDay>
  </time>
</template>

<style scoped lang="scss">
.calendar-month {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: var(--size-month-dow-row) repeat(5, 1fr);

  .day-of-week {
    border-bottom: 1px solid var(--color-border-default);
    margin: var(--space-month-dow);
  }

  .day {
    min-width: 0;
    border: solid var(--color-border-default);
    border-width: 0 1px 1px 0;
    font-size: var(--font-size-day);

    .tasks {
      flex: 1;
    }
  }

  &.minimized {
    border: none;
    height: 100%;
    overflow: hidden;

    .day-of-week {
      border: none;
    }

    .day {
      border: none;
      font-size: var(--font-size-day-minimized);
      overflow: hidden;
    }
  }
}
</style>
