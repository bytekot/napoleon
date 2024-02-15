import { useCalendar } from '../calendar/hooks'
import { CalendarWeek } from './component'

export function CalendarWeekContainer () {
    const { date } = useCalendar()

    return (
        <CalendarWeek date={date} />
    )
}
