import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CalendarDay from '../CalendarDay.vue'

describe('CalendarDay', () => {
  it('рендерит номер дня', () => {
    const wrapper = mount(CalendarDay, {
      props: { date: new Date(2026, 0, 15) },
    })

    expect(wrapper.find('.date').text()).toBe('15')
  })

  it('добавляет класс today для сегодняшней даты', () => {
    const wrapper = mount(CalendarDay, {
      props: { date: new Date() },
    })

    expect(wrapper.classes()).toContain('today')
  })

  it('не добавляет класс today для другой даты', () => {
    const wrapper = mount(CalendarDay, {
      props: { date: new Date(2020, 0, 1) },
    })

    expect(wrapper.classes()).not.toContain('today')
  })

  it('добавляет класс current-month для текущего месяца', () => {
    const now = new Date()
    const wrapper = mount(CalendarDay, {
      props: { date: new Date(now.getFullYear(), now.getMonth(), 10) },
    })

    expect(wrapper.classes()).toContain('current-month')
  })

  it('добавляет класс minimized при minimized=true', () => {
    const wrapper = mount(CalendarDay, {
      props: { date: new Date(2026, 0, 1), minimized: true },
    })

    expect(wrapper.classes()).toContain('minimized')
  })

  it('не рендерит slot контент при minimized=true', () => {
    const wrapper = mount(CalendarDay, {
      props: { date: new Date(2026, 0, 1), minimized: true },
      slots: { default: '<div class="slot-content">test</div>' },
    })

    expect(wrapper.find('.slot-content').exists()).toBe(false)
  })

  it('рендерит slot контент при minimized=false', () => {
    const wrapper = mount(CalendarDay, {
      props: { date: new Date(2026, 0, 1), minimized: false },
      slots: { default: '<div class="slot-content">test</div>' },
    })

    expect(wrapper.find('.slot-content').exists()).toBe(true)
  })
})
