import { useSelector } from 'react-redux'
import { selectTaskById } from '../../store/entities/task/selectors'
import { Task } from './component'
import { Task as TaskType } from '../../types'
import { RootState } from '../../store'
import { useCalendar } from '../calendar/hooks'

import styles from './styles.module.scss'

import classNames from 'classnames'

interface TaskContainerProps {
    taskId: string
    className?: string
    onCheckChange?: (taskId: string, event: React.ChangeEvent<HTMLInputElement>) => void
    onDragStart?: (taskId: string, event: React.DragEvent) => void
}

export function TaskContainer ({ taskId, className, onCheckChange, onDragStart }: TaskContainerProps) {
    const task: TaskType = useSelector((state: RootState) => selectTaskById(state, taskId))
    const { isPeriodMonth, movingItem } = useCalendar()

    return (
        <div data-task>
            <Task
                task={task}
                className={classNames(className, {
                    // [styles.dragged]: movingItem === taskId,
                    [styles.mini]: isPeriodMonth,
                })}
                draggable={true}
                onDragStart={onDragStart}
                onCheckChange={onCheckChange}
            />
        </div>
    )
}
