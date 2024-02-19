import { useDispatch, useSelector } from 'react-redux'
import { selectTaskIdsByDueDate, selectTaskLoadingStatus, selectUnplannedTaskIds } from '../../store/entities/task/selectors'
import { Tasks } from './component'
import { REQUEST_STATUSES } from '../../constants/request-statuses'
import { editTask } from '../../store/entities/task/thunks/edit-task'
import { AppDispatch, RootState } from '../../store'
import { useDraggableTask } from './hooks'
import { TASK_STATUSES } from '../../constants/task-statuses'
import { useRef } from 'react'
import { useCalendar } from '../calendar/hooks'

interface TasksContainerProps {
    status?: string
    dueDate?: string
    emptyText?: string
    allowReordering?: boolean
    className?: string
}

export function TasksContainer ({ dueDate, className, emptyText }: TasksContainerProps) {
    const dispatch = useDispatch<AppDispatch>()

    const onDropHandler = (id, order) => {
        dispatch(editTask({ id, dueDate, order }))
    }
    const { draggedTaskOrder, onDragOver, onDragLeave, onDrop } = useDraggableTask(onDropHandler)

    const selector = !dueDate
        ? selectUnplannedTaskIds
        : (state: RootState) => selectTaskIdsByDueDate(state, dueDate)
    const taskIds = useSelector(selector)
    const isLoading = useSelector(selectTaskLoadingStatus) === REQUEST_STATUSES.pending

    const onTaskCheckChange = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(editTask(
            {
                id,
                status: event.target.checked ? TASK_STATUSES.completed : TASK_STATUSES.planned,
            }
        ))
    }

    const { setMovingItem } = useCalendar()
    const movingTaskRef = useRef<any>()

    const onDragStart = (id: string, event: React.DragEvent) => {
        movingTaskRef.current = event.target

        event.target.addEventListener('dragend', () => setMovingItem?.(null))

        setMovingItem?.(event.target)

        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.setData('text/plain', id)
        }
    }

    return (
        isLoading
            ? 'Загрузка...'
            : <Tasks
                taskIds={taskIds}
                className={className}
                emptyText={emptyText}

                draggedTaskOrder={draggedTaskOrder}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}

                onTaskCheckChange={onTaskCheckChange}
                onTaskDragStart={onDragStart}
            />
    )
} 
