export const CALENDAR_PERIODS = {
    week: 'week',
    month: 'month',
    year: 'year',
} as const

export const DAYS_OF_WEEK = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

export const CALENDAR_REDUCER_ACTIONS = {
    setDate: 'setDate',
    setPeriod: 'setPeriod',
    setMovingItem: 'setMovingItem',
    setNextDate: 'setNextDate',
    setPreviousDate: 'setPreviousDate',
} as const
