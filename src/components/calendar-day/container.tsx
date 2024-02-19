import { useCalendar } from '../calendar/hooks'
import { CalendarDay, CalendarDayProps } from './component'

import styles from './styles.module.scss'

import classNames from 'classnames'

export function CalendarDayContainer ({ children, date, className }: CalendarDayProps) {
    const { isPeriodMonth } = useCalendar()

    return (
        <CalendarDay
            date={date}
            className={classNames(className, {
                [styles.mini]: isPeriodMonth,
                [styles.currentMonth]: new Date().getMonth() === new Date(date).getMonth(),
            })}
        >
            {children}
        </CalendarDay>
    )
}
