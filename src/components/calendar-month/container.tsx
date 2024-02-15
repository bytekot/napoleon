import { useCalendar } from '../calendar/hooks'
import { CalendarMonth } from './component'

export function CalendarMonthContainer({ className }: { className?: string }) {
    const { date } = useCalendar()

    return (
        <CalendarMonth className={className} date={date} />
    )
}
