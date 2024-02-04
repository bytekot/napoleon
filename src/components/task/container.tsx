import { useSelector } from 'react-redux'
import { selectTaskById } from '../../store/entities/task/selectors'
import { Task } from './component'
import { Task as TaskType } from '../../types'

export const TaskContainer = ({ taskId }: { taskId: string }) => {
    const task: TaskType = useSelector(state => selectTaskById(state, taskId))

    return <Task task={task} />
}
