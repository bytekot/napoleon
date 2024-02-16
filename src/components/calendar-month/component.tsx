import { getMonth, getMonthWeekDates } from '../../utils/calendar'
import { CalendarWeek } from '../calendar-week/component'

import styles from './styles.module.scss'

import classNames from 'classnames'

export function CalendarMonth ({ date, className }: { date: Date, className?: string }) {
    return (
        <time dateTime={`${getMonth(date)}`} className={classNames(styles.calendarMonth, className)}>
            {
                getMonthWeekDates(date).map((date: Date, index: number) =>
                    <CalendarWeek key={index} className={styles.week} date={date} />
                )
            }
        </time>
    )
}
