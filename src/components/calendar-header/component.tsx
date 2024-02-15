import { CalendarPeriodControls } from '../calendar-period-controls/component'

import styles from './styles.module.scss'

import classNames from 'classnames'

export function CalendarHeader ({ className, text }: { className?: string, text?: string }) {
    return (
        <div className={classNames(styles.calendarHeader, className)}>
            <h1>{text}</h1>
            <CalendarPeriodControls className={styles.controls} />
        </div>
    )
}
