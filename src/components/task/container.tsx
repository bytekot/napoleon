import { Task } from './component'
import { TaskContainerProps } from '../../types/tasks'
import { useTask } from '../../hooks/tasks'

export function TaskContainer ({ taskId, className, onCheckChange, onDragStart }: TaskContainerProps) {
    const { task } = useTask(taskId)

    return (
        <div data-task>
            <Task
                task={task}
                className={className}
                draggable={true}
                onDragStart={onDragStart}
                onCheckChange={onCheckChange}
            />
        </div>
    )
}
