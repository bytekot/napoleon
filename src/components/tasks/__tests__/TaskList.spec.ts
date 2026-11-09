import { describe, it, expect, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import TaskList from '../TaskList.vue'

describe('TaskList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('устанавливает data-due-date на корневой элемент для конкретного дня', () => {
    const wrapper = shallowMount(TaskList, {
      props: { dueDate: '2026-11-09' },
    })

    expect(wrapper.attributes('data-due-date')).toBe('2026-11-09')
  })

  it('устанавливает data-due-date="unplanned" при dueDate=null', () => {
    const wrapper = shallowMount(TaskList, {
      props: { dueDate: null },
    })

    expect(wrapper.attributes('data-due-date')).toBe('unplanned')
  })
})
