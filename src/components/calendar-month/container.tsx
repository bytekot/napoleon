import { getCalendarMonthDates, getMonth } from '../../utils/calendar'
import { useCalendar } from '../calendar/hooks'
import { CalendarMonth } from './component'

interface Props {
    className?: string
    date?: Date
}

export function CalendarMonthContainer ({ className, date }: Props) {
    const { date: currentDate } = useCalendar()

    const dates = getCalendarMonthDates(date ?? currentDate)
    const dateTime = getMonth(date ?? currentDate)

    return (
        <CalendarMonth
            className={className}
            dates={dates}
            dateTime={dateTime}
        />
    )
}
