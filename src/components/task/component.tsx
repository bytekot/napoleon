import { TASK_STATUSES } from '../../constants/task-statuses'
import { Task as TaskType } from '../../types'

import styles from './styles.module.scss'

import classNames from 'classnames'

interface TaskProps {
    task: TaskType
    className?: string
    draggable?: boolean
    onDragStart?: (event: React.DragEvent) => void
    onMouseUp?: (event: React.MouseEvent) => void
}

export function Task({ task, className, draggable = false, onDragStart,  onMouseUp }: TaskProps) {
    // todo: move to container
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const isCompleted = task?.status === TASK_STATUSES.completed
    const isOverdue = !isCompleted && task?.dueDate && new Date(task.dueDate) < now

    return (
        <div
            className={classNames(styles.task, className, {
                [styles.completed]: isCompleted,
                [styles.overdue]: isOverdue,
            })}
            draggable={draggable && !isCompleted}
            onDragStart={onDragStart}
            onMouseUp={onMouseUp}
        >
            <span className={styles.style}></span>
            <span>
                <label>
                    <input type='checkbox' checked={isCompleted} />
                    <span className={styles.checkmark}></span>
                    <span className={styles.text}>{task.name}</span>
                </label>
            </span>
        </div>
    )
}
