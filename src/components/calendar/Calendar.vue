<script setup lang="ts">
import CalendarHeader from '../calendar-header/CalendarHeader.vue'
import CalendarWeek from '../calendar-week/CalendarWeek.vue'
import CalendarMonth from '../calendar-month/CalendarMonth.vue'
import CalendarYear from '../calendar-year/CalendarYear.vue'
import { useCalendarStore } from '../../stores/calendar'
import { useCalendarRoute } from '../../composables/useCalendarRoute'

useCalendarRoute()

const store = useCalendarStore()
</script>

<template>
  <div class="calendar">
    <CalendarHeader class="header" />
    <CalendarWeek v-if="store.isPeriodWeek" :date="store.date" class="view" />
    <CalendarMonth v-else-if="store.isPeriodMonth" :date="store.date" class="view" />
    <CalendarYear v-else-if="store.isPeriodYear" :date="store.date" class="view" />
  </div>
</template>

<style scoped lang="scss">
.calendar {
  display: flex;
  flex-direction: column;

  .header {
    flex: 0;
  }

  .view {
    flex: 1;
  }
}
</style>
