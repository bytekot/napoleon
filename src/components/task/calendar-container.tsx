import { Task } from './component'
import { TaskContainerProps } from '../../types/tasks'
import { useTask } from '../../hooks/tasks'
import { useCalendar } from '../calendar/hooks'

import styles from './styles.module.scss'

import classNames from 'classnames'

export function TaskCalendarContainer ({ taskId, className, onCheckChange, onDragStart }: TaskContainerProps) {
    const { task } = useTask(taskId)
    const { isPeriodMonth, movingItemId, setMovingItem } = useCalendar()

    function onDragStartHandler (id: string, event: React.DragEvent) {
        onDragStart && onDragStart(id, event)
        setMovingItem && setMovingItem({ id, element: event.target })
    }

    return (
        <div data-task>
            <Task
                task={task}
                className={classNames(className, {
                    [styles.dragged]: movingItemId === taskId,
                    [styles.mini]: isPeriodMonth,
                })}
                draggable={true}
                onDragStart={onDragStartHandler}
                onCheckChange={onCheckChange}
            />
        </div>
    )
}
