import { describe, it, expect } from 'vitest'
import {
  getThisMonday,
  getWeekDayDates,
  getCalendarMonthDates,
  getDateWithOffset,
  isToday,
  getMonthName,
} from '../calendar'
import { CALENDAR_PERIODS } from '../../constants/calendar'

describe('getThisMonday', () => {
  it('для понедельника возвращает тот же день', () => {
    expect(getThisMonday(new Date(2026, 10, 2))).toEqual(new Date(2026, 10, 2))
  })

  it('для воскресенья возвращает понедельник предыдущей недели', () => {
    expect(getThisMonday(new Date(2026, 10, 1))).toEqual(new Date(2026, 9, 26))
  })

  it('для субботы возвращает понедельник текущей недели', () => {
    expect(getThisMonday(new Date(2026, 10, 7))).toEqual(new Date(2026, 10, 2))
  })

  it('для вторника возвращает понедельник текущей недели', () => {
    expect(getThisMonday(new Date(2026, 10, 3))).toEqual(new Date(2026, 10, 2))
  })

  it('для среды возвращает понедельник текущей недели', () => {
    expect(getThisMonday(new Date(2026, 10, 4))).toEqual(new Date(2026, 10, 2))
  })
})

describe('getWeekDayDates', () => {
  it('для воскресенья возвращает неделю, начавшуюся 6 дней назад', () => {
    const dates = getWeekDayDates(new Date(2026, 10, 1))
    expect(dates).toHaveLength(7)
    expect(dates[0]).toEqual(new Date(2026, 9, 26))
    expect(dates[6]).toEqual(new Date(2026, 10, 1))
  })

  it('для понедельника возвращает неделю с этого дня', () => {
    const dates = getWeekDayDates(new Date(2026, 10, 2))
    expect(dates).toHaveLength(7)
    expect(dates[0]).toEqual(new Date(2026, 10, 2))
    expect(dates[6]).toEqual(new Date(2026, 10, 8))
  })
})

describe('getCalendarMonthDates', () => {
  it('возвращает 35 дат для сетки месяца', () => {
    const dates = getCalendarMonthDates(new Date(2026, 10, 1))
    expect(dates).toHaveLength(35)
  })

  it('начинается с понедельника недели первого числа', () => {
    const dates = getCalendarMonthDates(new Date(2026, 10, 1))
    expect(dates[0]).toEqual(new Date(2026, 9, 26))
  })
})

describe('getDateWithOffset', () => {
  it('добавляет месяцы', () => {
    const result = getDateWithOffset(new Date(2026, 0, 15), CALENDAR_PERIODS.month, 2)
    expect(result.getMonth()).toBe(2)
  })

  it('добавляет недели', () => {
    const result = getDateWithOffset(new Date(2026, 0, 1), CALENDAR_PERIODS.week, 2)
    expect(result.getDate()).toBe(15)
  })

  it('добавляет годы', () => {
    const result = getDateWithOffset(new Date(2026, 5, 15), CALENDAR_PERIODS.year, 1)
    expect(result.getFullYear()).toBe(2027)
  })

  it('переход через границу года', () => {
    const result = getDateWithOffset(new Date(2026, 11, 15), CALENDAR_PERIODS.month, 1)
    expect(result.getFullYear()).toBe(2027)
    expect(result.getMonth()).toBe(0)
  })
})

describe('isToday', () => {
  it('возвращает true для сегодняшней даты', () => {
    expect(isToday(new Date())).toBe(true)
  })

  it('возвращает false для другой даты', () => {
    expect(isToday(new Date(2020, 0, 1))).toBe(false)
  })
})

describe('getMonthName', () => {
  it('возвращает название месяца с заглавной буквы', () => {
    const name = getMonthName(new Date(2026, 0, 1))
    expect(name.charAt(0)).toBe(name.charAt(0).toUpperCase())
  })
})
