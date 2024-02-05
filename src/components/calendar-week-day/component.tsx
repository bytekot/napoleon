import { TASK_STATUSES } from '../../constants/task-statuses'
import { Day } from '../../types'
import { TasksContainer } from '../tasks/container'

import styles from './styles.module.scss'

export function CalendarWeekDay({ day }: { day: Day }) {
    return (
        <div className={styles.calendarWeekDay}>
            <div>{day.day} {day.date}</div>
            <TasksContainer status={TASK_STATUSES.planned} dueDate={day.date} />
        </div>
    )
}
