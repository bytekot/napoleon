import { useDispatch, useSelector } from 'react-redux'
import { selectTaskIdsByDueDate, selectTaskLoadingStatus, selectUnplannedTaskIds } from '../../store/entities/task/selectors'
import { Tasks } from './component'
import { REQUEST_STATUSES } from '../../constants/request-statuses'
import { editTask } from '../../store/entities/task/thunks/edit-task'
import { AppDispatch, RootState } from '../../store'
import { useTrackTaskOrder } from './hooks'
import { TASK_STATUSES } from '../../constants/task-statuses'

interface TasksContainerProps {
    status?: string
    dueDate?: string
    emptyText?: string
    allowReordering?: boolean
    className?: string
    onTaskDragStart?: (id: string, event: React.DragEvent) => void
}

export function TasksContainer ({ dueDate, className, emptyText, onTaskDragStart }: TasksContainerProps) {
    const selector = !dueDate
        ? selectUnplannedTaskIds
        : (state: RootState) => selectTaskIdsByDueDate(state, dueDate)

    const taskIds = useSelector(selector)
    const isLoading = useSelector(selectTaskLoadingStatus) === REQUEST_STATUSES.pending

    const dispatch = useDispatch<AppDispatch>()
    const {
        draggedTaskOrder,
        onDragOver,
        onDragLeave,
        onDrop,
        onDragStart,
    } = useTrackTaskOrder((id, order) => {
        dispatch(editTask(
            { id, dueDate, order }
        ))
    })

    function onTaskCheckChange (id: string, event: React.ChangeEvent<HTMLInputElement>) {
        dispatch(editTask(
            {
                id,
                status: event.target.checked ? TASK_STATUSES.completed : TASK_STATUSES.planned,
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

                draggedTaskOrder={draggedTaskOrder}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}

                onTaskCheckChange={onTaskCheckChange}
                onTaskDragStart={(taskId, event) => {
                    onDragStart(taskId, event)
                    onTaskDragStart?.(taskId, event)
                }}
            />
    )
}
