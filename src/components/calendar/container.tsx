import { Calendar } from './component'
import { useCalendar } from './hooks'

export function CalendarContainer ({ className }: { className?: string }) {
    const { date, period } = useCalendar()

    return (
        <Calendar date={date} period={period} className={className} />
    )
}
