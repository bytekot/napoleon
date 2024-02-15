import { getMonthWeekDates } from '../../utils/calendar'
import { CalendarWeek } from '../calendar-week/component'

import styles from './styles.module.scss'

import classNames from 'classnames'

export function CalendarMonth({ date, className }: { date: Date, className?: string }) {
    return (
        <time className={classNames(styles.calendarMonth, className)}>
            {
                getMonthWeekDates(date).map((date, index) =>
                    <CalendarWeek key={index} className={styles.week} date={date} />
                )
            }
        </time>
    )
}
