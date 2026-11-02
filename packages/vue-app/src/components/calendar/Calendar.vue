<script setup lang="ts">
import CalendarHeader from '../calendar-header/CalendarHeader.vue'
import CalendarWeek from '../calendar-week/CalendarWeek.vue'
import CalendarMonth from '../calendar-month/CalendarMonth.vue'
import CalendarYear from '../calendar-year/CalendarYear.vue'
import { useCalendarStore } from '../../stores/calendar'

const store = useCalendarStore()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onItemDragStart(_id: string, _event: DragEvent) {
  // Будет реализовано на Этапе 6: store.setMovingItem({ id, element: event.target })
}
</script>

<template>
  <div class="calendar">
    <CalendarHeader class="header" />
    <CalendarWeek
      v-if="store.isPeriodWeek"
      :date="store.date"
      class="view"
      @item-drag-start="onItemDragStart"
    />
    <CalendarMonth
      v-else-if="store.isPeriodMonth"
      :date="store.date"
      class="view"
      @item-drag-start="onItemDragStart"
    />
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
