import { createContext, useState } from 'react'
import { CALENDAR_VIEWS } from '../../constants/calendar'

type CalendarView = keyof typeof CALENDAR_VIEWS

interface CalendarProviderProps {
    children: React.ReactNode
    defaultDate?: Date
    defaultView?: CalendarView
}

export const CalendarContext = createContext({})

export function CalendarProvider(
    {
        children,
        defaultDate = new Date(),
        defaultView = CALENDAR_VIEWS.week
    }
        : CalendarProviderProps
) {
    const [date, setDate] = useState<Date>(defaultDate)
    const [view, setView] = useState<CalendarView>(defaultView)

    return (
        <CalendarContext.Provider value={{ date, view, setDate, setView }}>
            {children}
        </CalendarContext.Provider>
    )
}
