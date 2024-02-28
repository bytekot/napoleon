import { CALENDAR_PERIODS } from '../constants/calendar'
import { CalendarPeriod } from '../types/calendar'

export function getWeekDayDates (date: Date): Date[] {
    const monday = getThisMonday(date)

    return Array.from({ length: 7 }, (_, index) =>
        new Date(
            monday.getFullYear(),
            monday.getMonth(),
            monday.getDate() + index
        )
    )
}

export function getMonthWeekDates (date: Date): Date[] {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)

    return Array.from({ length: 5 }, (_, index) =>
        new Date(
            firstDay.getFullYear(), 
            firstDay.getMonth(),
            firstDay.getDate() + index * 7
        )
    )
}

export function getYearMonthDates (date: Date): Date[] {
    return Array.from({ length: 12 }, (_, index) =>
        new Date(
            date.getFullYear(),
            0 + index
        )
    )
}

export function getCalendarMonthDates (date: Date): Date[] {
    const firstDay = getThisMonday(
        new Date(date.getFullYear(), date.getMonth(), 1)
    )
    const year = firstDay.getFullYear()
    const month = firstDay.getMonth()
    const dateOfMonth = firstDay.getDate()

    return Array.from({ length: 35 }, (_, index) =>
        new Date(year, month, dateOfMonth + index)
    )
}

export function getThisMonday (now: Date): Date {
    const day = now.getDay()

    if (day === 1) return now

    const date = now.getDate()
    const month = now.getMonth()
    const year = now.getFullYear()

    return new Date(year, month, date - (day - 1))
}

export function getMonthName (date: Date): string {
    const month = date.toLocaleString('ru', { month: 'long' })

    return `${month.charAt(0).toUpperCase()}${month.slice(1)}`
}

export function getMonth (date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}`
}

export function isCurrentMonth (date: Date): boolean {
    return new Date().getMonth() === date.getMonth()
}

export function isToday (date: Date): boolean {
    return new Date().toDateString() === date.toDateString()
}

export function getDateWithOffset (date: Date, period: CalendarPeriod, offset: number): Date {
    let month = date.getMonth()
    let dateOfMonth = date.getDate()
    let year = date.getFullYear()

    switch (period) {
        case CALENDAR_PERIODS.month:
            month = month + offset
            break
        case CALENDAR_PERIODS.week:
            dateOfMonth = dateOfMonth + offset * 7
            break
        case CALENDAR_PERIODS.year:
            year = year + offset
            break
    }

    return new Date(year, month, dateOfMonth)
}
