import { getMonthName } from '../../utils/calendar'
import { Calendar } from './component'
import { useCalendar } from './hooks'

export function CalendarContainer ({ className }: { className?: string }) {
    const { date, period } = useCalendar()

    const headerText = `${getMonthName(date)} ${date.getFullYear()}`

    return (
        <Calendar
            className={className}
            period={period} 
            header={headerText}
        />
    )
}
