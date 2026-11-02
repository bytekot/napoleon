import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia, type Pinia } from 'pinia'
import CalendarHeader from '../CalendarHeader.vue'
import { useCalendarStore } from '../../../stores/calendar'

describe('CalendarHeader', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  function mountHeader() {
    return mount(CalendarHeader, { global: { plugins: [pinia] } })
  }

  it('рендерит текст периода (месяц + год)', () => {
    const store = useCalendarStore()

    store.setDate(new Date(2026, 0, 15))

    const wrapper = mountHeader()

    expect(wrapper.find('h1').text()).toBe('Январь 2026')
  })

  it('рендерит корректный текст для другого месяца', () => {
    const store = useCalendarStore()

    store.setDate(new Date(2026, 5, 20))

    const wrapper = mountHeader()

    expect(wrapper.find('h1').text()).toBe('Июнь 2026')
  })
})
