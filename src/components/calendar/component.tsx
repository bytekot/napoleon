import { CALENDAR_PERIODS } from '../../constants/calendar'
import { CalendarPeriod } from '../../types/calendar'
import { CalendarHeaderContainer } from '../calendar-header/container'
import { CalendarMonthContainer } from '../calendar-month/container'
import { CalendarWeekContainer } from '../calendar-week/container'
import { CalendarYearContainer } from '../calendar-year/container'

import styles from './styles.module.scss'
import classNames from 'classnames'

interface CalendarProps {
    period: CalendarPeriod
    header?: string
    className?: string
}

export function Calendar ({ period, header, className }: CalendarProps) {
    return (
        <div className={classNames(styles.calendar, className)}>
            <CalendarHeaderContainer
                className={styles.header}
                text={header} 
            />
            {
                {
                    [CALENDAR_PERIODS.week]: <CalendarWeekContainer className={styles.week} />,
                    [CALENDAR_PERIODS.month]: <CalendarMonthContainer className={styles.month} />,
                    [CALENDAR_PERIODS.year]: <CalendarYearContainer className={styles.year} />,
                }[period]
            }
        </div>
    )
}
