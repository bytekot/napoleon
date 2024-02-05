import { Task as TaskType } from '../../types'

export const Task = ({ task }: { task: TaskType }) => {
    const onDragStart = (event: React.DragEvent) => {
        event.dataTransfer.setData('taskId', task.id)
    }

    return (
        <div draggable onDragStart={onDragStart}>{task.name || '—'}</div>
    )
}
