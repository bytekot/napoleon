import { Task } from './component'
import { TaskContainerProps } from '../../types/tasks'
import { useTask } from '../../hooks/tasks'
import { useCalendar } from '../calendar/hooks'

import styles from './styles.module.scss'

import classNames from 'classnames'

export function TaskCalendarContainer ({ taskId, className, onCheckChange, onDragStart }: TaskContainerProps) {
    const { task } = useTask(taskId)
    const { isPeriodMonth, movingItemId } = useCalendar()

    return (
        <div data-task>
            <Task
                task={task}
                className={classNames(className, {
                    [styles.dragged]: movingItemId === taskId,
                    [styles.mini]: isPeriodMonth,
                })}
                draggable={true}
                onDragStart={onDragStart}
                onCheckChange={onCheckChange}
            />
        </div>
    )
}
