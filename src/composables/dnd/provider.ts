import { defineComponent, h } from 'vue'
import { DnDProvider } from '@vue-dnd-kit/core'

export const DndScope = defineComponent({
  setup(_, { slots }) {
    return () => h(DnDProvider, null, slots.default?.())
  },
})
