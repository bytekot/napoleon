import { Calendar } from './component'
import { CalendarProvider } from './context'

export function CalendarContainer ({ date, className }: { date: Date, className?: string }) {
    return (
        <CalendarProvider defaultDate={date}>
            <Calendar className={className} />
        </CalendarProvider>
    )
}
