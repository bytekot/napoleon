import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia, type Pinia } from 'pinia'
import CalendarDateControls from '../CalendarDateControls.vue'
import { useCalendarStore } from '../../../stores/calendar'

describe('CalendarDateControls', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  function mountControls() {
    return mount(CalendarDateControls, { global: { plugins: [pinia] } })
  }

  it('кнопка ← вызывает setPreviousDate', async () => {
    const store = useCalendarStore()

    store.setDate(new Date(2026, 0, 15))

    const wrapper = mountControls()
    const buttons = wrapper.findAll('button')

    await buttons[0]!.trigger('click')

    expect(store.date.getDate()).toBe(8)
  })

  it('кнопка Сегодня вызывает setToday', async () => {
    const store = useCalendarStore()

    store.setDate(new Date(2020, 5, 1))

    const wrapper = mountControls()
    const buttons = wrapper.findAll('button')

    await buttons[1]!.trigger('click')

    expect(store.date.toDateString()).toBe(new Date().toDateString())
  })

  it('кнопка → вызывает setNextDate', async () => {
    const store = useCalendarStore()

    store.setDate(new Date(2026, 0, 15))

    const wrapper = mountControls()
    const buttons = wrapper.findAll('button')

    await buttons[2]!.trigger('click')

    expect(store.date.getDate()).toBe(22)
  })
})
