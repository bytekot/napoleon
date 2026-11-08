<script setup lang="ts">
import { computed } from 'vue'
import { useCalendarStore } from '../../stores/calendar'
import { useTaskStore } from '../../stores/task'
import { CALENDAR_PERIODS } from '../../constants/calendar'
import { getMonthName } from '../../utils/calendar'
import ActionArea from '../action-area/ActionArea.vue'
import CaretUp from '../icon/CaretUp.vue'
import Trash from '../icon/Trash.vue'
import CalendarPeriodControls from '../calendar-period-controls/CalendarPeriodControls.vue'
import CalendarDateControls from '../calendar-date-controls/CalendarDateControls.vue'

const store = useCalendarStore()
const taskStore = useTaskStore()

const headerText = computed(() => `${getMonthName(store.date)} ${store.date.getFullYear()}`)

const isDndMode = computed(() => store.isDndMode)

function onTogglePeriodEnter() {
  const target = store.isPeriodMonth ? CALENDAR_PERIODS.week : CALENDAR_PERIODS.month

  setTimeout(() => store.setPeriod(target), 200)
}

function onDeleteDrop(event: DragEvent) {
  const id = event.dataTransfer?.getData('text/plain')

  if (!id) return
  void taskStore.deleteTask(id)
}
</script>

<template>
  <div class="calendar-header" :class="{ 'dnd-mode': isDndMode }">
    <h1>{{ headerText }}</h1>
    <ActionArea class="action-toggle-period" @enter="onTogglePeriodEnter">
      <CaretUp size="medium" />
    </ActionArea>
    <ActionArea class="action-delete" dangerous @drop="onDeleteDrop">
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
  align-items: center;
  min-height: var(--size-header-height);
  padding: var(--space-header-padding-y) 0;
  box-sizing: border-box;
  background: var(--color-bg-header);

  h1 {
    font-size: var(--font-size-heading);
    font-weight: var(--font-weight-heading);
    letter-spacing: var(--letter-spacing-heading);
    color: var(--color-text-secondary);
    padding-left: var(--space-header-title-x);
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
    width: var(--size-delete-area);
  }

  &.dnd-mode {
    .action-toggle-period,
    .action-delete {
      opacity: 1;
      transition: var(--transition-header-dnd);
    }

    .action-delete {
      display: block;
    }
  }
}
</style>
