import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCalendarStore } from '../calendar'
import { CALENDAR_PERIODS } from '../../constants/calendar'

describe('useCalendarStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('начальное состояние', () => {
    it('date ≈ now', () => {
      const store = useCalendarStore()
      const now = new Date()

      expect(store.date.toDateString()).toBe(now.toDateString())
    })

    it('period === week', () => {
      const store = useCalendarStore()

      expect(store.period).toBe(CALENDAR_PERIODS.week)
    })
  })

  describe('setDate', () => {
    it('обновляет date', () => {
      const store = useCalendarStore()
      const newDate = new Date(2026, 0, 15)

      store.setDate(newDate)

      expect(store.date).toEqual(newDate)
    })
  })

  describe('setPeriod + getters', () => {
    it('setPeriod(month) → period === month, isPeriodMonth === true, isPeriodWeek === false', () => {
      const store = useCalendarStore()

      store.setPeriod(CALENDAR_PERIODS.month)

      expect(store.period).toBe(CALENDAR_PERIODS.month)
      expect(store.isPeriodMonth).toBe(true)
      expect(store.isPeriodWeek).toBe(false)
    })

    it('setPeriod(year) → isPeriodYear === true, остальные === false', () => {
      const store = useCalendarStore()

      store.setPeriod(CALENDAR_PERIODS.year)

      expect(store.isPeriodYear).toBe(true)
      expect(store.isPeriodWeek).toBe(false)
      expect(store.isPeriodMonth).toBe(false)
    })
  })

  describe('setNextDate', () => {
    it('при period=week: date += 7 дней', () => {
      const store = useCalendarStore()
      const startDate = new Date(2026, 0, 10)

      store.setDate(startDate)
      store.setPeriod(CALENDAR_PERIODS.week)

      store.setNextDate()

      expect(store.date.getDate()).toBe(17)
    })

    it('при period=month: month += 1', () => {
      const store = useCalendarStore()
      const startDate = new Date(2026, 0, 15)

      store.setDate(startDate)
      store.setPeriod(CALENDAR_PERIODS.month)

      store.setNextDate()

      expect(store.date.getMonth()).toBe(1)
    })

    it('при period=year: year += 1', () => {
      const store = useCalendarStore()
      const startDate = new Date(2026, 5, 15)

      store.setDate(startDate)
      store.setPeriod(CALENDAR_PERIODS.year)

      store.setNextDate()

      expect(store.date.getFullYear()).toBe(2027)
    })
  })

  describe('setPreviousDate', () => {
    it('при period=week: date -= 7 дней', () => {
      const store = useCalendarStore()
      const startDate = new Date(2026, 0, 17)

      store.setDate(startDate)
      store.setPeriod(CALENDAR_PERIODS.week)

      store.setPreviousDate()

      expect(store.date.getDate()).toBe(10)
    })

    it('через границу месяца (31 янв → 24 янв при week)', () => {
      const store = useCalendarStore()
      const startDate = new Date(2026, 0, 31)

      store.setDate(startDate)
      store.setPeriod(CALENDAR_PERIODS.week)

      store.setPreviousDate()

      expect(store.date.getDate()).toBe(24)
      expect(store.date.getMonth()).toBe(0)
    })
  })

  describe('setToday', () => {
    it('date.toDateString() === new Date().toDateString()', () => {
      const store = useCalendarStore()

      store.setDate(new Date(2020, 5, 1))

      store.setToday()

      expect(store.date.toDateString()).toBe(new Date().toDateString())
    })
  })
})
