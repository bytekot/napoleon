<script setup lang="ts">
import { computed } from 'vue'
import { useCalendarStore } from '../../stores/calendar'
import { getMonthName } from '../../utils/calendar'
import ActionArea from '../action-area/ActionArea.vue'
import CaretUp from '../icon/CaretUp.vue'
import Trash from '../icon/Trash.vue'
import CalendarPeriodControls from '../calendar-period-controls/CalendarPeriodControls.vue'
import CalendarDateControls from '../calendar-date-controls/CalendarDateControls.vue'

const store = useCalendarStore()

const headerText = computed(() => `${getMonthName(store.date)} ${store.date.getFullYear()}`)
</script>

<template>
  <div class="calendar-header">
    <h1>{{ headerText }}</h1>
    <ActionArea class="action-toggle-period">
      <CaretUp size="medium" />
    </ActionArea>
    <ActionArea class="action-delete" dangerous>
      <Trash size="medium" />
    </ActionArea>
    <CalendarPeriodControls class="period-controls" />
    <CalendarDateControls class="date-controls" />
  </div>
</template>

<style scoped lang="scss">
.calendar-header {
  display: flex;
  flex-direction: row;
  background: #eee;

  h1 {
    color: #999;
    padding-left: 20px;
  }

  .action-toggle-period,
  .action-delete {
    opacity: 0;
  }

  .action-toggle-period {
    flex: 1;
  }

  .action-delete {
    display: none;
    width: 200px;
  }

  &.dnd-mode {
    .action-toggle-period,
    .action-delete {
      opacity: 1;
      transition: 0.2s all ease;
    }

    .action-delete {
      display: block;
    }
  }
}
</style>
