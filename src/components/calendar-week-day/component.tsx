import { TASK_STATUSES } from '../../constants/task-statuses'
import { TasksContainer } from '../tasks/container'

import styles from './styles.module.scss'

import classNames from 'classnames'

export function CalendarWeekDay({ date, className }: { date: Date, className?: string }) {
    return (
        <time
            className={classNames(styles.calendarWeekDay, className, {
                [styles.today]: new Date().toDateString() === date.toDateString(),
            })}
        >
            <div className={styles.header}>
                <h2>{date.getDate()} </h2>
                <span>{date.toLocaleDateString('ru', { weekday: 'short' })}</span>
            </div>
            <TasksContainer
                status={TASK_STATUSES.planned}
                dueDate={`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`}
                className={styles.tasks}
            />
        </time>
    )
}
