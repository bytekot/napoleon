import { TASK_STATUSES } from '../../constants/task-statuses'
import { Day } from '../../types'
import { TasksContainer } from '../tasks/container'

import styles from './styles.module.scss'

import classNames from 'classnames'

export function CalendarWeekDay({ day }: { day: Day }) {
    const date = new Date(day.date)

    return (
        <div
            className={classNames(styles.calendarWeekDay, {
                [styles.today]: new Date().toDateString() === date.toDateString(),
            })}
        >
            <div className={styles.header}>
                <h2>{date.getDate()} </h2>
                <span>{day.day}</span>
            </div>
            <TasksContainer
                status={TASK_STATUSES.planned}
                dueDate={day.date}
                className={styles.tasks}
            />
        </div>
    )
}
