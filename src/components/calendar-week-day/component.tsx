import { TASK_STATUSES } from '../../constants/task-statuses'
import { Day } from '../../types'
import { TasksContainer } from '../tasks/container'

import styles from './styles.module.scss'

import classNames from 'classnames'

export function CalendarWeekDay({ day }: { day: Day }) {
    return (
        <div
            className={classNames(styles.calendarWeekDay, {
                [styles.today]: day.isToday,
            })}
        >
            <div className={styles.header}>
                <strong>{new Date(day.date).getDate()} </strong>
                <span>{day.day}</span>
            </div>
            <TasksContainer status={TASK_STATUSES.planned} dueDate={day.date} />
        </div>
    )
}
