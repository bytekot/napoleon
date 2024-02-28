import { CALENDAR_PERIODS } from '../../constants/calendar'
import { isCurrentMonth, isToday } from '../../utils/calendar'
import { useCalendar } from '../calendar/hooks'
import { CalendarDay } from './component'

import styles from './styles.module.scss'
import classNames from 'classnames'

interface Props {
    children?: React.ReactNode
    date: Date
    className?: string
}

export function CalendarDayContainer ({ children, date, className }: Props) {
    const { period } = useCalendar()

    return (
        <CalendarDay
            date={date.getDate()}
            className={classNames(className, {
                // [styles.mini]: period === CALENDAR_PERIODS.month,
                [styles.currentMonth]: isCurrentMonth(date),
                [styles.today]: isToday(date),
            })}
            minimized={period === CALENDAR_PERIODS.year}
        >
            {children}
        </CalendarDay>
    )
}
