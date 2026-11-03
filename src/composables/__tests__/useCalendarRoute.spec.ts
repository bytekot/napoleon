import { describe, it, expect, beforeEach, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { setActivePinia, createPinia, type Pinia } from 'pinia'
import { useCalendarRoute } from '../useCalendarRoute'
import { useCalendarStore } from '../../stores/calendar'
import { CALENDAR_PERIODS } from '../../constants/calendar'

const Host = defineComponent({
  setup() {
    useCalendarRoute()

    return () => h('div')
  },
})

describe('useCalendarRoute', () => {
  let pinia: Pinia
  let router: Router

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: Host }],
    })
  })

  async function mountAt(url: string) {
    await router.push(url)
    await router.isReady()

    return mount(Host, { global: { plugins: [pinia, router] } })
  }

  it('инициализирует store из валидного ?period=month', async () => {
    await mountAt('/?period=month')

    expect(useCalendarStore().period).toBe(CALENDAR_PERIODS.month)
  })

  it('не делает лишнего replace, когда query совпадает со store', async () => {
    const replaceSpy = vi.spyOn(router, 'replace')

    await mountAt('/?period=year')
    await flushPromises()

    expect(replaceSpy).not.toHaveBeenCalled()
  })

  it('пишет дефолт week в query при отсутствии period', async () => {
    await mountAt('/')
    await flushPromises()

    expect(router.currentRoute.value.query.period).toBe('week')
  })

  it('игнорирует невалидный ?period=foo и нормализует URL до week', async () => {
    await mountAt('/?period=foo')
    await flushPromises()

    expect(useCalendarStore().period).toBe(CALENDAR_PERIODS.week)
    expect(router.currentRoute.value.query.period).toBe('week')
  })

  it('обновляет query при изменении store', async () => {
    await mountAt('/?period=week')
    await flushPromises()

    useCalendarStore().setPeriod(CALENDAR_PERIODS.year)
    await flushPromises()

    expect(router.currentRoute.value.query.period).toBe('year')
  })

  it('сохраняет прочие query-параметры при нормализации', async () => {
    await mountAt('/?foo=bar')
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ foo: 'bar', period: 'week' })
  })
})
