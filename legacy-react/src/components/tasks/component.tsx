import { PlusIcon } from '../../assets/icons/plus-icon/component'
import { TaskCalendarContainer } from '../task/calendar-container'

import styles from './styles.module.scss'
import classNames from 'classnames'

interface TasksProps {
    taskIds: string[]
    className?: string
    emptyText?: string
    movingItemOrder?: number | null
    onDragOver?: (event: React.DragEvent) => void
    onDrop?: (event: React.DragEvent) => void
    onDragLeave?: (event: React.DragEvent) => void
    onItemCheckChange?: (id: string, event: React.ChangeEvent<HTMLInputElement>) => void
    onItemDragStart?: (id: string, event: React.DragEvent) => void
}

export function Tasks ({
    taskIds,
    className,
    emptyText,
    movingItemOrder,
    onDragOver,
    onDrop,
    onDragLeave,
    onItemCheckChange,
    onItemDragStart,
}: TasksProps) {
    const emptyTextVisible = emptyText && !taskIds.length
    const addIconVisible = movingItemOrder !== null && !taskIds.length

    return (
        <div
            className={classNames(styles.tasks, className)}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            {
                emptyTextVisible && <div className={styles.emptyText}>{emptyText}</div>
            }
            {
                addIconVisible && <PlusIcon className={styles.addTask} />
            }
            <div data-tasks className={styles.container}>
                {
                    taskIds.map((taskId: string, index: number) => {
                        return (
                            <TaskCalendarContainer
                                key={index}
                                taskId={taskId}
                                className={classNames({
                                    [styles.borderTop]: index === movingItemOrder,
                                    [styles.borderBottom]: index + 1 === movingItemOrder,
                                })}
                                onCheckChange={onItemCheckChange}
                                onDragStart={onItemDragStart}
                            />
                        )
                    })
                }
            </div>
        </div>
    )
}
