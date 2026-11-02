import { TaskProps } from '../../types/tasks'

import styles from './styles.module.scss'

import classNames from 'classnames'

export function Task ({
    task,
    className,
    draggable = false,
    onDragStart,
    onCheckChange,
}: TaskProps
) {
    const { id, name, dueDate, completed } = task
    // todo: move from view or create new status
    const now = new Date(); now.setHours(0, 0, 0, 0)
    const isOverdue = !completed && dueDate && new Date(dueDate) < now

    return (
        <div
            className={classNames(styles.task, className, {
                [styles.completed]: completed,
                [styles.overdue]: isOverdue,
            })}
            draggable={draggable && !completed}
            onDragStart={event => onDragStart && onDragStart(id, event)}
        >
            <span className={styles.style} />
            <span>
                <label>
                    <input
                        type='checkbox'
                        checked={completed}
                        onChange={event => onCheckChange && onCheckChange(id, event)}
                    />
                    <span className={styles.checkmark} />
                    <span className={styles.text}>{name}</span>
                </label>
            </span>
        </div>
    )
}
