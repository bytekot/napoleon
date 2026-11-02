import { CALENDAR_PERIODS } from '../../constants/calendar'
import { getCalendarMonthDates, getMonth } from '../../utils/calendar'
import { useCalendar } from '../calendar/hooks'
import { CalendarMonth } from './component'

import styles from './styles.module.scss'
import classNames from 'classnames'

interface Props {
    className?: string
    date?: Date
}

export function CalendarMonthContainer ({ className, date }: Props) {
    const { date: currentDate, period } = useCalendar()

    const dates = getCalendarMonthDates(date ?? currentDate)
    const dateTime = getMonth(date ?? currentDate)

    return (
        <CalendarMonth
            className={classNames(className, {
                [styles.minimized]: period === CALENDAR_PERIODS.year,
            })}
            dates={dates}
            dateTime={dateTime}
        />
    )
}
