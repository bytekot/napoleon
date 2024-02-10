import { TaskDraggableContainer } from '../task/container'

import styles from './styles.module.scss'

export function Tasks({ taskIds }: { taskIds: string[] }) {
    return (
        <div className={styles.tasks}>
            {
                taskIds.map((taskId: string) => <TaskDraggableContainer key={taskId} taskId={taskId} />)
            }
        </div>
    )
}
