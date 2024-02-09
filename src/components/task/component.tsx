import { Task as TaskType } from '../../types'

import styles from './styles.module.scss'

export const Task = ({ task }: { task: TaskType }) => {
    return (
        <span className={styles.task}>
            <span className={styles.style}></span>
            <span>{task.name || '—'}</span>
        </span>
    )
}
