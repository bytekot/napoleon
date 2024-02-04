import { useSelector } from 'react-redux'
import { selectTaskById } from '../../store/entities/task/selectors'
import { Task } from './component'
import { Task as TaskType } from '../../types'
import { State } from '../../store/types'

export const TaskContainer = ({ taskId }: { taskId: string }) => {
    const task: TaskType = useSelector((state: State) => selectTaskById(state, taskId))

    return <Task task={task} />
}
