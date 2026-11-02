<script setup lang="ts">
import { computed } from 'vue'
import CalendarDay from '../calendar-day/CalendarDay.vue'
import TasksList from '../tasks/TasksList.vue'
import { getWeekDayDates, formatDateISO } from '../../utils/calendar'

const props = defineProps<{
  date: Date
}>()

const emit = defineEmits<{
  itemDragStart: [id: string, event: DragEvent]
}>()

const weekDates = computed(() => getWeekDayDates(props.date))
</script>

<template>
  <time class="calendar-week">
    <CalendarDay v-for="(dayDate, index) in weekDates" :key="index" :date="dayDate" class="day">
      <TasksList
        :due-date="formatDateISO(dayDate)"
        class="tasks"
        @item-drag-start="(id, event) => emit('itemDragStart', id, event)"
      />
    </CalendarDay>
  </time>
</template>

<style scoped lang="scss">
.calendar-week {
  display: flex;
  border-top: 1px solid #ddd;

  .day {
    flex: 1;
    border-right: 1px solid #ddd;

    .tasks {
      flex: 1;
    }
  }
}
</style>
