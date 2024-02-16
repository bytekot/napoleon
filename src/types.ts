import { CALENDAR_PERIODS } from './constants/calendar'

export interface Task {
    id: string
    name: string
    creationDate: string
    dueDate: string | null
    order: number | null
    status: string
}

export type CalendarPeriod = (typeof CALENDAR_PERIODS)[keyof typeof CALENDAR_PERIODS]
