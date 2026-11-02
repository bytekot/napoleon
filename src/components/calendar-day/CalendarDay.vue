<script setup lang="ts">
import { computed } from 'vue'
import { isToday, isCurrentMonth } from '../../utils/calendar'

const props = withDefaults(
  defineProps<{
    date: Date
    minimized?: boolean
  }>(),
  {
    minimized: false,
  },
)

const today = computed(() => isToday(props.date))
const currentMonth = computed(() => isCurrentMonth(props.date))
const dayNumber = computed(() => props.date.getDate())
</script>

<template>
  <div
    class="calendar-day"
    :class="{
      today,
      'current-month': currentMonth,
      minimized,
    }"
  >
    <div class="date">{{ dayNumber }}</div>
    <slot v-if="!minimized" />
  </div>
</template>

<style scoped lang="scss">
.calendar-day {
  color: #00000081;
  padding: 5px;

  &.today {
    background-color: #e5e5e5;
  }

  &:not(.minimized) {
    display: flex;
    flex-direction: column;
  }
}
</style>
