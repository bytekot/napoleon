import { ActionAreaContainer } from '../action-area/container'
import { CaretUpIcon } from '../../assets/icons/caret-up/component'
import { CalendarDateControlsContainer } from '../calendar-date-controls/container'
import { CalendarPeriodControlsContainer } from '../calendar-period-controls/container'
import { TrashIcon } from '../../assets/icons/trash-icon/component'

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
            <ActionAreaContainer
                className={styles.actionTogglePeriod}
                onEnter={onTogglePeriodEnter}
            >
                <CaretUpIcon />
            </ActionAreaContainer>
            <ActionAreaContainer
                className={styles.actionDelete}
                onDrop={onDeleteDrop}
                dangerous={true}
            >
                <TrashIcon />
            </ActionAreaContainer>
            <CalendarPeriodControlsContainer className={styles.periodControls} />
            <CalendarDateControlsContainer className={styles.dateControls} />
        </div>
    )
}
