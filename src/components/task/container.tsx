import { useSelector } from 'react-redux'
import { selectTaskById } from '../../store/entities/task/selectors'
import { Task } from './component'
import { Task as TaskType } from '../../types'
import { State } from '../../store/types'
import { useState } from 'react'

import styles from './styles.module.scss'

import classNames from 'classnames'

export function TaskDraggableContainer ({ taskId, className }: { taskId: string, className?: string }) {
    const task: TaskType = useSelector((state: State) => selectTaskById(state, taskId))
    const [isDragged, setIsDragged] = useState(false)

    const onDragStart = (event: DragEvent) => {
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.setData('text/plain', taskId)
        }
        setIsDragged(true)
    }
    const onDragEnd = () => setIsDragged(false)

    return (
        <Task
            task={task}
            className={classNames(className, {
                [styles.dragged]: isDragged,
            })}
            draggable={true}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        />
    )
}
