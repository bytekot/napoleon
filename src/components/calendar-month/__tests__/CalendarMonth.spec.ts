import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia, type Pinia } from 'pinia'
import CalendarMonth from '../CalendarMonth.vue'

describe('CalendarMonth', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  function mountMonth(date: Date = new Date(2026, 10, 1), minimized = false) {
    return mount(CalendarMonth, {
      props: { date, minimized },
      global: { plugins: [pinia], stubs: { TaskList: true } },
    })
  }

  it('рендерит 35 дней', () => {
    const wrapper = mountMonth()

    expect(wrapper.findAll('.day')).toHaveLength(35)
  })

  it('рендерит 7 заголовков дней недели', () => {
    const wrapper = mountMonth()

    expect(wrapper.findAll('.day-of-week')).toHaveLength(7)
  })

  it('добавляет класс minimized при minimized=true', () => {
    const wrapper = mountMonth(new Date(2026, 10, 1), true)

    expect(wrapper.classes()).toContain('minimized')
  })

  it('имеет атрибут datetime', () => {
    const wrapper = mountMonth(new Date(2026, 10, 1))

    expect(wrapper.attributes('datetime')).toBe('2026-11')
  })
})
