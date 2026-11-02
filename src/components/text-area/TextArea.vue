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
  background: #eee;
  border: none;
  border-radius: 4px;
  color: #555;
  font-size: 14px;
  resize: none;
  box-shadow:
    inset 1px 1px 1px 0 rgba(0, 0, 0, 0.2),
    inset -1px -1px 1px 0 rgba(255, 255, 255, 0.5);
  padding: 10px;

  &:focus {
    outline: none;
  }
}
</style>
