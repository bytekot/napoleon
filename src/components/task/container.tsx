import { useDispatch, useSelector } from 'react-redux'
import { selectTaskById } from '../../store/entities/task/selectors'
import { Task } from './component'
import { Task as TaskType } from '../../types'
import { useRef, useState } from 'react'
import { TASK_STATUSES } from '../../constants/task-statuses'
import { editTask } from '../../store/entities/task/thunks/edit-task'
import { AppDispatch, RootState } from '../../store'
import { useCalendar } from '../calendar/hooks'

import styles from './styles.module.scss'

import classNames from 'classnames'

// Must be synchronized with styles (-900ms)
const SET_COMPLETED_TIMEOUT = 1100

export function TaskDraggableContainer({ taskId, className }: { taskId: string, className?: string }) {
    const task: TaskType = useSelector((state: RootState) => selectTaskById(state, taskId))
    const { isPeriodMonth, movingItem, setMovingItem } = useCalendar()
    const [timerId, setTimerId] = useState<number | null>(null)
    const dispatch = useDispatch<AppDispatch>()
    const myRef = useRef(null)

    const onDragStart = (event: React.DragEvent) => {
        const movingTaskEl = myRef.current

        movingTaskEl?.addEventListener('dragend', () => setMovingItem(null))
        setMovingItem(movingTaskEl)

        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.setData('text/plain', taskId)
        }
    }

    const clearTimer = () => {
        if (timerId) {
            clearTimeout(timerId)
            setTimerId(null)
        }
    }
    const onMouseDown = () => {
        setTimerId(
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
    }
    const onMouseUp = () => clearTimer()

    return (
        <div data-task ref={myRef}>
            <Task
                task={task}
                className={classNames(className, {
                    [styles.dragged]: movingItem === taskId,
                    [styles.showProgress]: !!timerId,
                    [styles.mini]: isPeriodMonth,
                })}
                draggable={!timerId}
                onDragStart={onDragStart}
                // onMouseDown={onMouseDown}
                // onMouseUp={onMouseUp}
            />
        </div>
    )
}
