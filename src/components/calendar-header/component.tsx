import { ActionArea } from '../action-area/component'
import { CalendarDateControlsContainer } from '../calendar-date-controls/container'
import { CalendarPeriodControlsContainer } from '../calendar-period-controls/container'

import styles from './styles.module.scss'

import classNames from 'classnames'

interface CalendarHeaderProps {
    className?: string
    text?: string
    onTogglePeriodEnter?: (event: React.DragEvent<HTMLDivElement>) => void
    onDeleteDrop?: (event: React.DragEvent<HTMLDivElement>) => void
}

export function CalendarHeader ({ className, text, onTogglePeriodEnter, onDeleteDrop }: CalendarHeaderProps) {
    return (
        <div className={classNames(styles.calendarHeader, className)}>
            <h1>{text}</h1>
            <ActionArea
                className={styles.actionTogglePeriod}
                onDragEnter={onTogglePeriodEnter}
            >
                {'⇧'}
            </ActionArea>
            <ActionArea
                className={styles.actionDelete}
                onDrop={onDeleteDrop}
            >
                {'☒'}
            </ActionArea>
            <CalendarPeriodControlsContainer className={styles.periodControls} />
            <CalendarDateControlsContainer className={styles.dateControls} />
        </div>
    )
}
