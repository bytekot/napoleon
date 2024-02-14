import { TASK_STATUSES } from '../../constants/task-statuses'
import { Task as TaskType } from '../../types'

import styles from './styles.module.scss'

import classNames from 'classnames'

interface TaskProps {
    task: TaskType
    className?: string
    draggable?: boolean
    onDragStart?: (event: React.DragEvent) => void
    onDragEnd?: (event: React.DragEvent) => void
    onMouseDown?: (event: React.MouseEvent) => void
    onMouseUp?: (event: React.MouseEvent) => void
}

export function Task({ task, className, draggable = false, onDragStart, onDragEnd, onMouseDown, onMouseUp }: TaskProps) {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const isCompleted = task?.status === TASK_STATUSES.completed
    const isOverdue = !isCompleted && task?.dueDate && new Date(task.dueDate) < now

    return (
        <div
            data-task
            className={classNames(styles.task, className, {
                [styles.completed]: isCompleted,
                [styles.overdue]: isOverdue,
            })}
            draggable={draggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
        >
            <div className={styles.progressBar} />
            <span className={styles.style}></span>
            <span>
                {isCompleted ? <span className={styles.checked}>✓</span> : ''}
                {task?.name || '—'}
            </span>
        </div>
    )
}
