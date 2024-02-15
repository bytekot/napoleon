import { useContext } from 'react'
import { CalendarContext } from './context'

export function useCalendar () {
    return useContext(CalendarContext)
}
