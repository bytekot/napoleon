import { TASK_STATUSES } from '../../constants/task-statuses'
import { Day } from '../../types'
import { TasksContainer } from '../tasks/container'

import styles from './styles.module.scss'

import classNames from 'classnames'

interface CalendarWeekDayProps {
    day: Day
    onDragOver: (event: React.DragEvent) => void
    onDrop: (event: React.DragEvent) => void
}

export function CalendarWeekDay({ day, onDragOver, onDrop }: CalendarWeekDayProps) {
    return (
        <div
            className={classNames(styles.calendarWeekDay, {
                [styles.today]: day.isToday,
            })}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <div className={styles.header}>
                <strong>{new Date(day.date).getDate()} </strong>
                <span>{day.day}</span>
            </div>
            <TasksContainer status={TASK_STATUSES.planned} dueDate={day.date} />
        </div>
    )
}
