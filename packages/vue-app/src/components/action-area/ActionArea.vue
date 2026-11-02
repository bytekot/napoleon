<script setup lang="ts">
withDefaults(
  defineProps<{
    dangerous?: boolean
  }>(),
  {
    dangerous: false,
  },
)

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <div class="action-area" :class="{ dangerous }">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.action-area {
  background: #e1e1e1;
  color: #f5f5f5;
  font-size: 32px;
  text-align: center;
  padding: 4px 20px;

  :deep(svg) {
    fill: #d5d5d5;
  }

  &.dangerous {
    background: rgba(255, 0, 0, 0.2);
  }
}
</style>
