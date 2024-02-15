import { useCalendar } from '../calendar/hooks'
import { CalendarWeek } from './component'

export function CalendarWeekContainer ({ className }: { className?: string }) {
    const { date } = useCalendar()

    return (
        <CalendarWeek date={date} className={className} />
    )
}
