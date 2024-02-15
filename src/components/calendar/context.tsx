import { createContext, useState } from 'react'

export const CalendarContext = createContext({})

export function CalendarProvider ({ children, defaultDate = new Date() }: { children: React.ReactNode, defaultDate: Date }) {
    const [date, setDate] = useState<Date>(defaultDate)

    return (
        <CalendarContext.Provider value={{ date, setDate }}>
            {children}
        </CalendarContext.Provider>
    )
}
