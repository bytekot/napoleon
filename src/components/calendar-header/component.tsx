import { CalendarDateControlsContainer } from '../calendar-date-controls/container'
import { CalendarPeriodControlsContainer } from '../calendar-period-controls/container'

import styles from './styles.module.scss'

import classNames from 'classnames'

interface CalendarHeaderProps {
    className?: string
    text?: string
    onDragEnter?: (event: React.DragEvent<HTMLDivElement>) => void
    onDragLeave?: (event: React.DragEvent<HTMLDivElement>) => void
}

export function CalendarHeader ({ className, text, onDragEnter, onDragLeave }: CalendarHeaderProps) {
    return (
        <div
            className={classNames(styles.calendarHeader, className)}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
        >
            <h1>{text}</h1>
            <div className={styles.actionIcon}>{'⇧'}</div>
            <CalendarPeriodControlsContainer className={styles.periodControls} />
            <CalendarDateControlsContainer className={styles.dateControls} />
        </div>
    )
}
