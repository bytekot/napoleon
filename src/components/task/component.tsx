import { Task as TaskType } from '../../store/entities/task/thunks/get-tasks'

export const Task = ({ task }: { task: TaskType }) => {
    return <div>{task.name}</div>
}
