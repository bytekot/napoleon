import { TASK_STATUSES } from '../../constants/task-statuses'
import { Task as TaskType } from '../../types/tasks'

import styles from './styles.module.scss'

import classNames from 'classnames'

interface TaskProps {
    task: TaskType
    className?: string
    draggable?: boolean
    // onDragStart?: (event: React.DragEvent) => void
    onDragStart?: (taskId: string, event: React.DragEvent) => void
    onCheckChange?: (taskId: string, event: React.ChangeEvent<HTMLInputElement>) => void
}

export function Task ({
    task,
    className,
    draggable = false,
    onDragStart,
    onCheckChange,
}: TaskProps
) {
    const { id, status, dueDate, name } = task
    const isCompleted = status === TASK_STATUSES.completed
    // todo: move from view or create new status
    const now = new Date(); now.setHours(0, 0, 0, 0)
    const isOverdue = !isCompleted && dueDate && new Date(dueDate) < now

    return (
        <div
            className={classNames(styles.task, className, {
                [styles.completed]: isCompleted,
                [styles.overdue]: isOverdue,
            })}
            draggable={draggable && !isCompleted}
            onDragStart={event => onDragStart && onDragStart(id, event)}
            // onDragStart={onDragStart}
        >
            <span className={styles.style} />
            <span>
                <label>
                    <input
                        type='checkbox'
                        checked={isCompleted}
                        onChange={event => onCheckChange && onCheckChange(id, event)}
                    />
                    <span className={styles.checkmark} />
                    <span className={styles.text}>{name}</span>
                </label>
            </span>
        </div>
    )
}
