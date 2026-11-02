import { getMonthName } from '../../utils/calendar'
import { CalendarMonthContainer } from '../calendar-month/container'

import styles from './styles.module.scss'
import classNames from 'classnames'

interface CalendarYearProps {
    dates: Date[]
    className?: string
}

export function CalendarYear ({ dates, className }: CalendarYearProps) {
    return (
        <time className={classNames(styles.calendarYear, className)}>
            {
                dates.map((date: Date, index: number) =>
                    <div key={index} className={styles.container}>
                        <h2 className={styles.header}>
                            {getMonthName(date)}
                        </h2>
                        <CalendarMonthContainer
                            className={styles.month}
                            date={date}
                        />
                    </div>
                )
            }
        </time>
    )
}
