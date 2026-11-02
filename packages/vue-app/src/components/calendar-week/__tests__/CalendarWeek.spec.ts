import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia, type Pinia } from 'pinia'
import CalendarWeek from '../CalendarWeek.vue'

describe('CalendarWeek', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  function mountWeek(date: Date = new Date(2026, 10, 2)) {
    return mount(CalendarWeek, {
      props: { date },
      global: { plugins: [pinia] },
    })
  }

  it('рендерит 7 дней', () => {
    const wrapper = mountWeek()

    expect(wrapper.findAll('.day')).toHaveLength(7)
  })

  it('рендерит компонент с классом calendar-week', () => {
    const wrapper = mountWeek()

    expect(wrapper.classes()).toContain('calendar-week')
  })
})
