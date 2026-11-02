<script setup lang="ts">
import { computed } from 'vue'
import CalendarMonth from '../calendar-month/CalendarMonth.vue'
import { getYearMonthDates, getMonthName } from '../../utils/calendar'

const props = defineProps<{
  date: Date
}>()

const yearMonths = computed(() => getYearMonthDates(props.date))
</script>

<template>
  <time class="calendar-year">
    <div v-for="(monthDate, index) in yearMonths" :key="index" class="container">
      <h2 class="header">{{ getMonthName(monthDate) }}</h2>
      <CalendarMonth :date="monthDate" :minimized="true" class="month" />
    </div>
  </time>
</template>

<style scoped lang="scss">
.calendar-year {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 1fr);
  grid-gap: 10px 60px;
  padding: 10px 15px;

  .container {
    display: flex;
    flex-direction: column;

    .header {
      text-align: right;
      margin: 0 auto 0 0;
      color: #aaa;
      padding: 10px 5px;
      font-size: 20px;
    }

    .month {
      flex: 1;
      background-color: #e9e9e9;
      border: 1px solid #ddd;
      border-radius: 10px;
      text-align: center;
      margin-bottom: 10px;
    }
  }
}
</style>
