import { CALENDAR_PERIODS } from '../../constants/calendar'
import { getMonthName } from '../../utils/calendar'
import { CalendarHeader } from '../calendar-header/component'
import { CalendarMonthContainer } from '../calendar-month/container'
import { CalendarWeekContainer } from '../calendar-week/container'

import styles from './styles.module.scss'

import classNames from 'classnames'

export function Calendar ({ date, period, className }: { date: Date, period: string, className?: string }) {
    return (
        <div className={classNames(styles.calendar, className)}>
            <CalendarHeader
                className={styles.header}
                text={`${getMonthName(date)} ${date.getFullYear()}`} 
            />
            {
                period !== CALENDAR_PERIODS.week
                    || <CalendarWeekContainer className={styles.week} />
            }
            {
                period !== CALENDAR_PERIODS.month
                    || <CalendarMonthContainer className={styles.month} />
            }
        </div>
    )
}
