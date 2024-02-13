import { Task as TaskType } from '../../types'

import styles from './styles.module.scss'

import classNames from 'classnames'

interface TaskProps {
    task: TaskType
    className?: string
    draggable?: boolean
    onDragStart?: (event: DragEvent) => void
    onDragEnd?: (event: DragEvent) => void
}

export function Task({ task, className, draggable = false, onDragStart, onDragEnd }: TaskProps) {
    return (
        <div
            data-task
            className={classNames(styles.task, className)}
            draggable={draggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            <span className={styles.style}></span>
            <span>{task?.name || '—'}</span>
        </div>
    )
}
