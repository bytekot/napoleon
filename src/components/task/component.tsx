import { Task as TaskType } from '../../types'
import styles from './styles.module.scss'

export const Task = ({ task }: { task: TaskType }) => {
    const onDragStart = (event: React.DragEvent) => {
        event.dataTransfer.setData('taskId', task.id)
    }

    return (
        <span className={styles.task} draggable onDragStart={onDragStart}>
            <span className={styles.style}></span>
            <span>{task.name || '—'}</span>
        </span>
    )
}
