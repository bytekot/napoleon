import { TASK_STATUSES } from '../../constants/task-statuses'
import { useCalendar } from '../calendar/hooks'
import { TasksContainer } from '../tasks/container'
import { CalendarDay } from './component'

import styles from './styles.module.scss'

import classNames from 'classnames'

export function CalendarDayTasksContainer ({ date, className }: { date: Date, className?: string }) {
    const { isPeriodMonth } = useCalendar()

    return (
        <CalendarDay date={date} className={classNames(className, {
            [styles.mini]: isPeriodMonth,
            [styles.currentMonth]: new Date().getMonth() === new Date(date).getMonth(),
        })}>
            <TasksContainer
                status={TASK_STATUSES.planned}
                dueDate={`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`}
                className={styles.tasks}
            />
        </CalendarDay>
    )
}
