import { Task as TaskType } from '../../types'

export const Task = ({ task }: { task: TaskType }) => {
    return <div>{task.name || '—'}</div>
}
