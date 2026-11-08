<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'

const props = withDefaults(
  defineProps<{
    placeholder?: string
    autoFocus?: boolean
    rows?: number
    autoResize?: boolean
    resize?: 'none' | 'vertical' | 'both'
    hint?: string
    hideHintOnFocus?: boolean
  }>(),
  {
    placeholder: undefined,
    autoFocus: undefined,
    rows: 2,
    autoResize: true,
    resize: 'none',
    hint: undefined,
    hideHintOnFocus: false,
  },
)

const modelValue = defineModel<string>()

const emit = defineEmits<{
  keydown: [event: KeyboardEvent]
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const isFocused = ref(false)
const needsJsResize = !CSS.supports('field-sizing', 'content')

function adjustHeight() {
  if (!needsJsResize || !props.autoResize) return

  const el = textareaRef.value

  if (!el) return

  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

watch(modelValue, () => {
  void nextTick(adjustHeight)
})

onMounted(() => {
  adjustHeight()
})
</script>

<template>
  <div class="text-area-wrapper">
    <textarea
      ref="textareaRef"
      v-model="modelValue"
      class="text-area"
      :class="{ 'js-resize': needsJsResize && autoResize }"
      :placeholder="placeholder"
      :autofocus="autoFocus"
      :rows="rows"
      :style="{ resize: autoResize && resize === 'none' ? 'none' : resize }"
      @keydown="emit('keydown', $event)"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />
    <span v-if="hint && !modelValue && (!hideHintOnFocus || !isFocused)" class="text-area-hint">{{
      hint
    }}</span>
  </div>
</template>

<style scoped lang="scss">
.text-area-wrapper {
  position: relative;
  display: flex;
}

.text-area {
  background: var(--color-bg-input);
  border: none;
  border-radius: var(--radius-control);
  color: var(--color-text-input);
  font-size: var(--font-size-input);
  box-shadow: var(--shadow-input-inset);
  padding: var(--space-input);
  font-family: inherit;
  line-height: inherit;
  box-sizing: border-box;
  width: 100%;
  field-sizing: content;

  &:focus {
    outline: none;
  }

  &.js-resize {
    field-sizing: initial;
  }
}

.text-area-hint {
  position: absolute;
  right: 8px;
  bottom: 4px;
  font-size: 11px;
  color: #999;
  pointer-events: none;
  user-select: none;
  opacity: 0.7;
}
</style>
