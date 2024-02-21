import { CALENDAR_PERIODS, CALENDAR_REDUCER_ACTIONS } from '../constants/calendar'

export type CalendarPeriod = keyof typeof CALENDAR_PERIODS

export interface CalendarState {
    date: Date
    period: CalendarPeriod
    movingItemId: string | null
    movingItemElement: React.MutableRefObject<Element | null>
}

export interface CalendarContextValue {
    date: Date
    period: CalendarPeriod
    movingItemId: string | null
    movingItemElement?: React.MutableRefObject<Element | null >
    setDate: (date: Date) => void
    setPeriod: (view: CalendarPeriod) => void
    isPeriodWeek: boolean
    isPeriodMonth: boolean
    setNextDate: () => void
    setPreviousDate: () => void
    setToday: () => void
    setMovingItem?: (item: MovingItem) => void
}

export interface MovingItem {
    id: string
    element: Element | null
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
    payload: MovingItem | null
}

export interface SetNextDateAction {
    type: typeof CALENDAR_REDUCER_ACTIONS.setNextDate
}

export interface SetPreviousDateAction {
    type: typeof CALENDAR_REDUCER_ACTIONS.setPreviousDate
}

export type CalendarReducerAction = SetDateAction | SetPeriodAction | SetMovingItemAction | SetNextDateAction | SetPreviousDateAction
