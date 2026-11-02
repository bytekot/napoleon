import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia, type Pinia } from 'pinia'
import CalendarYear from '../CalendarYear.vue'

describe('CalendarYear', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  function mountYear(date: Date = new Date(2026, 5, 15)) {
    return mount(CalendarYear, {
      props: { date },
      global: { plugins: [pinia] },
    })
  }

  it('рендерит 12 месяцев', () => {
    const wrapper = mountYear()

    expect(wrapper.findAll(':scope > .container')).toHaveLength(12)
  })

  it('рендерит заголовки месяцев', () => {
    const wrapper = mountYear()

    const headers = wrapper.findAll(':scope > .container > .header')
    expect(headers).toHaveLength(12)
    expect(headers[0]!.text()).toBe('Январь')
  })

  it('рендерит компонент с классом calendar-year', () => {
    const wrapper = mountYear()

    expect(wrapper.classes()).toContain('calendar-year')
  })
})
