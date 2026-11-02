import { defineStore } from 'pinia'
import { CALENDAR_PERIODS } from '../constants/calendar'
import type { CalendarPeriod } from '../types/calendar'
import { getDateWithOffset } from '../utils/calendar'

export const useCalendarStore = defineStore('calendar', {
  state: (): { date: Date; period: CalendarPeriod } => ({
    date: new Date(),
    period: CALENDAR_PERIODS.week,
  }),

  getters: {
    isPeriodWeek: (state) => state.period === CALENDAR_PERIODS.week,
    isPeriodMonth: (state) => state.period === CALENDAR_PERIODS.month,
  },

  actions: {
    setDate(date: Date) {
      this.date = date
    },

    setPeriod(period: CalendarPeriod) {
      this.period = period
    },

    setNextDate() {
      this.date = getDateWithOffset(this.date, this.period, 1)
    },

    setPreviousDate() {
      this.date = getDateWithOffset(this.date, this.period, -1)
    },

    setToday() {
      this.date = new Date()
    },
  },
})
