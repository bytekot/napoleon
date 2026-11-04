<script setup lang="ts">
defineProps<{
  placeholder?: string
  autoFocus?: boolean
}>()

const modelValue = defineModel<string>()

const emit = defineEmits<{
  keydown: [event: KeyboardEvent]
}>()
</script>

<template>
  <input
    v-model="modelValue"
    type="text"
    class="text-area"
    :placeholder="placeholder"
    :autofocus="autoFocus"
    @keydown="emit('keydown', $event)"
  />
</template>

<style scoped lang="scss">
.text-area {
  background: var(--color-bg-input);
  border: none;
  border-radius: var(--radius-control);
  color: var(--color-text-input);
  font-size: var(--font-size-input);
  resize: none;
  box-shadow: var(--shadow-input-inset);
  padding: var(--space-input);

  &:focus {
    outline: none;
  }
}
</style>
