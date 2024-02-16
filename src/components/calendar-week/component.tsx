import { getWeekDayDates } from '../../utils/calendar'
import { CalendarDay } from '../calendar-day/component'

import styles from './styles.module.scss'

import classNames from 'classnames'

export function CalendarWeek ({ date, className }: { date: Date, className?: string }) {
    return (
        // todo add datetime attr
        <time className={classNames(styles.calendarWeek, className)}>
            {
                getWeekDayDates(date).map((date, index) =>
                    <CalendarDay key={index} className={styles.day} date={date} />
                )
            }
        </time>
    )
}
