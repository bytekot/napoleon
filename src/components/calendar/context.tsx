import { createContext, useCallback, useState } from 'react'
import { CALENDAR_PERIODS } from '../../constants/calendar'
import { getDateWithOffset } from '../../utils/calendar'
import { CalendarPeriod } from '../../types'

const DEFAULT_DATE = new Date()
const DEFAULT_PERIOD = CALENDAR_PERIODS.week

interface CalendarContextValue {
    date: Date
    period: CalendarPeriod
    setDate: (date: Date) => void
    setPeriod: (view: CalendarPeriod) => void
    isPeriodWeek: boolean
    isPeriodMonth: boolean
    setNextDate: () => void
    setPreviousDate: () => void
    setToday: () => void
    movingItem: string | null
    setMovingItem: (id: string | null) => void
}

export const CalendarContext = createContext<CalendarContextValue>(
    { date: DEFAULT_DATE, period: DEFAULT_PERIOD } as CalendarContextValue
)

export function CalendarProvider({
    children,
    defaultDate = DEFAULT_DATE,
    defaultPeriod = DEFAULT_PERIOD,
}: {
    children: React.ReactNode
    defaultDate: Date
    defaultPeriod: CalendarPeriod
}) {
    const [date, setDate] = useState<Date>(defaultDate)
    const [period, setPeriod] = useState<CalendarPeriod>(defaultPeriod)
    const [movingItem, setMovingItem] = useState<string | null>(null)

    const isPeriodWeek = period === CALENDAR_PERIODS.week
    const isPeriodMonth = period === CALENDAR_PERIODS.month

    const setNextDate = useCallback(() =>
        setDate(currentDate => getDateWithOffset(currentDate, period, 1)),
        [period]
    )
    const setPreviousDate = useCallback(() =>
        setDate(currentDate => getDateWithOffset(currentDate, period, -1)),
        [period]
    )
    const setToday = () => setDate(new Date())

    return (
        <CalendarContext.Provider value={{
            date,
            period,
            setDate,
            setPeriod,
            isPeriodWeek,
            isPeriodMonth,
            setNextDate,
            setPreviousDate,
            setToday,
            movingItem,
            setMovingItem,
        }}>
            {children}
        </CalendarContext.Provider>
    )
}
