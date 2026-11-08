<script setup lang="ts">
withDefaults(
  defineProps<{
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <button class="button" :disabled="disabled" @click="emit('click', $event)">
    <span><slot /></span>
  </button>
</template>

<style scoped lang="scss">
.button {
  background-image: var(--button-bg);
  border-color: var(--button-border-color);
  border-style: solid;
  border-width: 1px;
  border-radius: var(--radius-control);
  box-shadow: var(--button-shadow);
  box-sizing: border-box;
  color: var(--color-text-primary);
  cursor: pointer;
  display: inline-block;
  height: var(--size-button-height);
  font-size: var(--font-size-button);
  outline: 0;
  overflow: hidden;
  padding: var(--space-button);
  text-align: center;
  text-decoration: none;
  text-overflow: ellipsis;
  user-select: none;
  touch-action: manipulation;
  white-space: nowrap;

  span {
    line-height: var(--line-height-button);

    :deep(svg) {
      fill: var(--color-text-primary);
    }
  }

  &:active {
    border-bottom-color: var(--button-border-color-active);
  }

  &:active:hover {
    border-bottom-color: var(--button-border-color-active);
  }

  &:hover {
    border-color: var(--button-border-color-hover);
  }

  &:focus-visible {
    border-color: var(--button-color-focus-border);
    box-shadow: var(--button-shadow-focus);
    outline: 0;
  }

  &[aria-pressed='true'] {
    background-image: none;
    background-color: var(--color-bg-input);
    box-shadow: var(--shadow-input-inset);

    &:focus-visible {
      box-shadow: var(--shadow-input-inset), var(--button-shadow-focus);
    }
  }
}
</style>
