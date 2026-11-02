import { useDispatch } from 'react-redux'
import { Tasks } from './component'
import { editTask } from '../../store/entities/task/thunks/edit-task'
import { AppDispatch } from '../../store'
import { useTasks, useTrackTask } from '../../hooks/tasks'

interface TasksContainerProps {
    dueDate?: string
    emptyText?: string
    allowReordering?: boolean
    className?: string
    onItemDragStart?: (id: string, event: React.DragEvent) => void
}

export function TasksContainer ({ dueDate, className, emptyText, onItemDragStart }: TasksContainerProps) {
    const { taskIds, isLoading } = useTasks(dueDate)
    const { position, track } = useTrackTask()
    const dispatch = useDispatch<AppDispatch>()

    function onDragOver (event: React.DragEvent) {
        event.preventDefault()
        track(event.target as Element, event.clientY)
    }

    function onDragLeave () {
        track(null)
    }

    function onDrop (event: React.DragEvent) {
        const id = event.dataTransfer.getData('text/plain')

        if (id  && position !== null) {
            dispatch(editTask(
                { id, dueDate, order: position }
            ))
            event.dataTransfer.setData('text/plain', '')
            track(null)
        }
    }

    function onTaskDragStart (id: string, event: React.DragEvent) {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', id)
        onItemDragStart?.(id, event)
    }

    function onTaskCheckChange (id: string, event: React.ChangeEvent<HTMLInputElement>) {
        dispatch(editTask(
            {
                id,
                completed: event.target.checked,
            }
        ))
    }

    return (
        isLoading
            ? 'Загрузка...'
            : <Tasks
                taskIds={taskIds}
                className={className}
                emptyText={emptyText}
                movingItemOrder={position}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onItemDragStart={onTaskDragStart}
                onItemCheckChange={onTaskCheckChange}
            />
    )
}
