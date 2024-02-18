import { CalendarDateControlsContainer } from '../calendar-date-controls/container'
import { CalendarPeriodControlsContainer } from '../calendar-period-controls/container'

import styles from './styles.module.scss'

import classNames from 'classnames'

export function CalendarHeader ({ className, text }: { className?: string, text?: string }) {
    return (
        <div className={classNames(styles.calendarHeader, className)}>
            <h1>{text}</h1>
            <CalendarPeriodControlsContainer className={styles.periodControls} />
            <CalendarDateControlsContainer className={styles.dateControls} />
        </div>
    )
}
