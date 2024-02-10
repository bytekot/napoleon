import { Task as TaskType } from '../../types'

import styles from './styles.module.scss'

import classNames from 'classnames'

type TaskProps = {
    task: TaskType
    className?: string
    draggable?: boolean
    onDragStart?: () => void
    onDragEnd?: () => void
    onDragOver?: () => void
    onDragLeave?: () => void
}

export function Task({ task, className, draggable = false, onDragStart, onDragEnd, onDragOver, onDragLeave }: TaskProps) {
    return (
        <div
            data-taskid={task.id}
            className={classNames(styles.task, className)}
            draggable={draggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
        >
            <span className={styles.style}></span>
            <span>{task?.name || '—'}</span>
        </div>
    )
}
