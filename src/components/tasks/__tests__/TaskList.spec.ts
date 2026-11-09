import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { DndScope } from '../../../composables/dnd'
import TaskList from '../TaskList.vue'

describe('TaskList', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    wrapper.unmount()
  })

  function mountTaskList(dueDate: string | null) {
    const TestWrapper = defineComponent({
      components: { DndScope, TaskList },
      setup() {
        return () => h(DndScope, null, () => h(TaskList, { dueDate }))
      },
    })

    wrapper = mount(TestWrapper, { attachTo: document.body })

    return wrapper
  }

  it('устанавливает data-due-date на корневой элемент для конкретного дня', () => {
    const w = mountTaskList('2026-11-09')

    expect(w.find('.task-list').attributes('data-due-date')).toBe('2026-11-09')
  })

  it('устанавливает data-due-date="unplanned" при dueDate=null', () => {
    const w = mountTaskList(null)

    expect(w.find('.task-list').attributes('data-due-date')).toBe('unplanned')
  })
})
