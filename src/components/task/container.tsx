import { useSelector } from 'react-redux'
import { selectTaskById } from '../../store/entities/task/selectors'
import { Task } from './component'
import { Task as TaskType } from '../../types'
import { State } from '../../store/types'
import { useContext, useState } from 'react'
import { DragAndDropContext } from '../../contexts/drag-and-drop/context'

import styles from './styles.module.scss'

export function TaskContainer ({ taskId, className }: { taskId: string, className?: string }) {
    const task: TaskType = useSelector((state: State) => selectTaskById(state, taskId))

    return <Task task={task} className={className} />
}

export function TaskDraggableContainer ({ taskId }: { taskId: string }) {
    const task: TaskType = useSelector((state: State) => selectTaskById(state, taskId))

    const { draggedTaskId, setDraggedTaskId } = useContext(DragAndDropContext)
    const [ draggedTaskVisible, setDraggedTaskVisible ] = useState(false)

    const onDragStart = () => setDraggedTaskId(taskId)
    const onDragEnd = () => setDraggedTaskId(null)
    const onDragOver = () => setDraggedTaskVisible(true)
    const onDragLeave = () => setDraggedTaskVisible(false)

    return (
        <>
            <Task
                task={task}
                className={draggedTaskVisible && (draggedTaskId === taskId) ? styles.dragged : ''}
                draggable={true}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                // onDragOver={onDragOver}
                // onDragLeave={onDragLeave}
            />
            {
                !(draggedTaskId && draggedTaskVisible && (draggedTaskId !== taskId))
                || <TaskContainer className={styles.dragged} taskId={draggedTaskId} />
            }
        </>
    )
}
