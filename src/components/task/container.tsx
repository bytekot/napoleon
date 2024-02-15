import { useDispatch, useSelector } from 'react-redux'
import { selectTaskById } from '../../store/entities/task/selectors'
import { Task } from './component'
import { Task as TaskType } from '../../types'
import { useState } from 'react'
import { TASK_STATUSES } from '../../constants/task-statuses'
import { editTask } from '../../store/entities/task/thunks/edit-task'
import { AppDispatch, RootState } from '../../store'

import styles from './styles.module.scss'

import classNames from 'classnames'

// Must be synchronized with styles (-900ms)
const SET_COMPLETED_TIMEOUT = 1100

export function TaskDraggableContainer ({ taskId, className }: { taskId: string, className?: string }) {
    const task: TaskType = useSelector((state: RootState) => selectTaskById(state, taskId))
    const [isDragged, setIsDragged] = useState(false)
    const [timerId, setTimerId] = useState<number | null>(null)
    const [timerId2, setTimerId2] = useState<number | null>(null)
    const dispatch = useDispatch<AppDispatch>()

    const onDragStart = (event: React.DragEvent) => {
        clearTimer2()

        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.setData('text/plain', taskId)
        }
        setIsDragged(true)
    }
    const onDragEnd = () => setIsDragged(false)

    const clearTimer = () => {
        if (timerId) {
            clearTimeout(timerId)
            setTimerId(null)
        }
    }
    const clearTimer2 = () => {
        if (timerId2) {
            clearTimeout(timerId2)
            setTimerId2(null)
        }
    }
    const shit = () => setTimerId(
        setTimeout(async () => {
            clearTimer()
            await dispatch(editTask(
                {
                    id: taskId,
                    status: task.status !== TASK_STATUSES.completed
                        ? TASK_STATUSES.completed
                        : TASK_STATUSES.planned,
                }
            ))
        },
        SET_COMPLETED_TIMEOUT
    ))
    const onMouseDown = () => {
        setTimerId2(
            setTimeout(() => {
                shit()
            }, 400)
        )
    }
    const onMouseUp = () => {
        clearTimer2()
        clearTimer()
    }

    const onDoubleClick = () => {
    }

    return (
        <Task
            task={task}
            className={classNames(className, {
                [styles.dragged]: isDragged,
                [styles.showProgress]: !!timerId,
            })}
            draggable={!timerId}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            // onDoubleClick={onDoubleClick}
        />
    )
}
