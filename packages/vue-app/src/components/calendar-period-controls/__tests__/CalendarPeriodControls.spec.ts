import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia, type Pinia } from 'pinia'
import CalendarPeriodControls from '../CalendarPeriodControls.vue'
import { useCalendarStore } from '../../../stores/calendar'
import { CALENDAR_PERIODS } from '../../../constants/calendar'

describe('CalendarPeriodControls', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  function mountControls() {
    return mount(CalendarPeriodControls, { global: { plugins: [pinia] } })
  }

  it('переключает period на week', async () => {
    const store = useCalendarStore()
    store.setPeriod(CALENDAR_PERIODS.month)

    const wrapper = mountControls()
    const buttons = wrapper.findAll('button')

    await buttons[0]!.trigger('click')

    expect(store.period).toBe(CALENDAR_PERIODS.week)
  })

  it('переключает period на month', async () => {
    const store = useCalendarStore()

    const wrapper = mountControls()
    const buttons = wrapper.findAll('button')

    await buttons[1]!.trigger('click')

    expect(store.period).toBe(CALENDAR_PERIODS.month)
  })

  it('переключает period на year', async () => {
    const store = useCalendarStore()

    const wrapper = mountControls()
    const buttons = wrapper.findAll('button')

    await buttons[2]!.trigger('click')

    expect(store.period).toBe(CALENDAR_PERIODS.year)
  })
})
