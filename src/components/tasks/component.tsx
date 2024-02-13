import { TaskDraggableContainer } from '../task/container'

import styles from './styles.module.scss'

interface TasksProps {
    taskIds: string[]
    emptyText?: string
    onDragOver?: (event: React.DragEvent) => void
    onDrop?: (event: React.DragEvent) => void
    onDragLeave?: (event: React.DragEvent) => void
    draggedTaskOrder: number | null
}

export function Tasks ({ taskIds, emptyText, onDragOver, onDrop, onDragLeave, draggedTaskOrder }: TasksProps) {
    return (
        <div
            data-tasks
            className={styles.tasks}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            {emptyText && !taskIds.length
                ? <div className={styles.emptyText}>{emptyText}</div>
                : false
            }
            {
                taskIds.map((taskId: string, index: number) => {
                    let className

                    if (index === draggedTaskOrder) {
                        className = styles.borderTop
                    } else if (draggedTaskOrder !== null && index === draggedTaskOrder - 1) {
                        className = styles.borderBottom
                    }

                    return (
                        <TaskDraggableContainer
                            key={index}
                            taskId={taskId}
                            className={className}
                        />
                    )
                })
            }
        </div>
    )
}
