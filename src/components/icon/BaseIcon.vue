<script setup lang="ts">
import type { Size } from '../../types/shared'

/**
 * Базовый компонент иконки.
 *
 * ## Передача CSS-классов
 *
 * Во Vue `class` — это fallthrough-атрибут. Он НЕ объявляется в props,
 * а автоматически передаётся корневому элементу компонента.
 *
 * При использовании:
 * ```vue
 * <BaseIcon class="custom-class" size="small">
 *   <path d="..." />
 * </BaseIcon>
 * ```
 *
 * Класс `custom-class` будет объединён с внутренними классами `['icon', size]`
 * благодаря автоматическому fallthrough на корневой `<svg>`.
 *
 * @see https://vuejs.org/guide/components/attrs.html#fallthrough-attributes
 */
defineProps<{
  size?: Size
}>()

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <svg
    :class="['icon', size]"
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    fill="#000"
    viewBox="0 0 256 256"
  >
    <slot />
  </svg>
</template>

<style scoped lang="scss">
.icon {
  fill: var(--color-icon-default);
  vertical-align: middle;

  &.small {
    height: var(--size-icon-small);
    width: var(--size-icon-small);
  }

  &.medium {
    height: var(--size-icon-medium);
    width: var(--size-icon-medium);
  }
}
</style>
