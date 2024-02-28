import { getYearMonthDates } from '../../utils/calendar'
import { useCalendar } from '../calendar/hooks'
import { CalendarYear } from './component'

export function CalendarYearContainer ({ className }: { className?: string }) {
    const { date } = useCalendar()
    const dates = getYearMonthDates(date)

    return (
        <CalendarYear
            dates={dates}
            className={className}
        />
    )
}
