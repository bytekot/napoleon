import { CALENDAR_PERIODS, CALENDAR_REDUCER_ACTIONS } from '../constants/calendar'

export type CalendarPeriod = keyof typeof CALENDAR_PERIODS

export interface CalendarState {
    date: Date
    period: CalendarPeriod
    movingItem: string | null
    movingItemRef: React.MutableRefObject<Element | null| undefined>
}

export interface CalendarContextValue extends CalendarState {
    setDate: (date: Date) => void
    setPeriod: (view: CalendarPeriod) => void
    isPeriodWeek: boolean
    isPeriodMonth: boolean
    setNextDate: () => void
    setPreviousDate: () => void
    setToday: () => void
    setMovingItem?: (el: Element | null) => void
}

export interface SetDateAction {
    type: typeof CALENDAR_REDUCER_ACTIONS.setDate
    payload: Date
}

export interface SetPeriodAction {
    type: typeof CALENDAR_REDUCER_ACTIONS.setPeriod
    payload: CalendarPeriod
}

export interface SetMovingItemAction {
    type: typeof CALENDAR_REDUCER_ACTIONS.setMovingItem
    payload: {
        id: string
        element: Element
    } | null
}

export interface SetNextDateAction {
    type: typeof CALENDAR_REDUCER_ACTIONS.setNextDate
}

export interface SetPreviousDateAction {
    type: typeof CALENDAR_REDUCER_ACTIONS.setPreviousDate
}

export type CalendarReducerAction = SetDateAction | SetPeriodAction | SetMovingItemAction | SetNextDateAction | SetPreviousDateAction
