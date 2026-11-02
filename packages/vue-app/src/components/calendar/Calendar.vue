<script setup lang="ts">
import CalendarHeader from '../calendar-header/CalendarHeader.vue'
</script>

<template>
  <div class="calendar">
    <CalendarHeader class="header" />
    <div class="view-area" />
  </div>
</template>

<style scoped lang="scss">
.calendar {
  display: flex;
  flex-direction: column;

  .header {
    flex: 0;
  }

  .view-area {
    flex: 1;
  }
}
</style>
