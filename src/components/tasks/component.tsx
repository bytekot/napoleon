import { TaskContainer } from '../task/container'

import styles from './styles.module.scss'

import classNames from 'classnames'

interface TasksProps {
    taskIds: string[]
    emptyText?: string
    onDragOver?: (event: React.DragEvent) => void
    onDrop?: (event: React.DragEvent) => void
    onDragLeave?: (event: React.DragEvent) => void
    draggedTaskOrder?: number | null
    className?: string
    onTaskCheckChange?: (id: string, event: React.ChangeEvent<HTMLInputElement>) => void
    onTaskDragStart?: (id: string, event: React.DragEvent) => void
}

export function Tasks ({
    taskIds,
    emptyText,
    onDragOver,
    onDrop,
    onDragLeave,
    draggedTaskOrder,
    className,
    onTaskCheckChange,
    onTaskDragStart,
}: TasksProps) {
    return (
        <div
            className={classNames(styles.tasks, className)}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            {
                emptyText && !taskIds.length &&
                <div className={styles.emptyText}>{emptyText}</div>
            }
            {
                draggedTaskOrder !== null && !taskIds.length &&
                <div className={styles.addTask}>┉</div>
            }
            <div data-tasks className={styles.container}>
                {
                    taskIds.map((taskId: string, index: number) => {
                        let className

                        if (index === draggedTaskOrder) {
                            className = styles.borderTop
                        } else if (draggedTaskOrder !== null && index === draggedTaskOrder - 1) {
                            className = styles.borderBottom
                        }

                        return (
                            <TaskContainer
                                key={index}
                                taskId={taskId}
                                className={className}
                                onCheckChange={onTaskCheckChange}
                                onDragStart={onTaskDragStart}
                            />
                        )
                    })
                }
            </div>
        </div>
    )
}
