import { useDispatch, useSelector } from 'react-redux'
import { selectTaskIds, selectTaskIdsByDueDate, selectTaskLoadingStatus, selectUnplannedTaskIds } from '../../store/entities/task/selectors'
import { Tasks } from './component'
import { REQUEST_STATUSES } from '../../constants/request-statuses'
import { TASK_STATUSES } from '../../constants/task-statuses'
import { editTask } from '../../store/entities/task/thunks/edit-task'
import { AppDispatch, RootState } from '../../store'
import { useDraggableTask } from './hooks'

interface TasksContainerProps {
    status?: string
    dueDate?: string
    emptyText?: string
    allowReordering?: boolean
    className?: string
}

export function TasksContainer ({ status, dueDate, emptyText, allowReordering = true, className }: TasksContainerProps) {
    const dispatch = useDispatch<AppDispatch>()
    const onDropHandler = (id, order) => {
        dispatch(editTask({id, dueDate, order}))
    }
    const { draggedTaskOrder, onDragOver, onDragLeave, onDrop } = useDraggableTask(onDropHandler)
    let selector

    switch (status) {
        case TASK_STATUSES.unplanned:
            selector = selectUnplannedTaskIds
            break
        case TASK_STATUSES.planned:
            selector = (state: RootState) => selectTaskIdsByDueDate(state, dueDate ?? new Date().toISOString())
            break
        case TASK_STATUSES.completed:
            selector = selectTaskIds
            break
        default:
            selector = selectTaskIds
    }

    const taskIds = useSelector(selector)
    const isLoading = useSelector(selectTaskLoadingStatus) === REQUEST_STATUSES.pending

    return (
        isLoading
            ? 'Загрузка...'
            : <Tasks
                taskIds={taskIds}
                emptyText={emptyText}
                className={className}
                draggedTaskOrder={draggedTaskOrder}
                onDragOver={allowReordering ? onDragOver : undefined}
                onDragLeave={allowReordering ? onDragLeave : undefined}
                onDrop={allowReordering ? onDrop : undefined}
            />
    )
}
