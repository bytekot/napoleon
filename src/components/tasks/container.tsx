import { useDispatch, useSelector } from 'react-redux'
import { selectTaskIds, selectTaskIdsByDueDate, selectTaskLoadingStatus, selectUnplannedTaskIds } from '../../store/entities/task/selectors'
import { Tasks } from './component'
import { REQUEST_STATUSES } from '../../constants/request-statuses'
import { TASK_STATUSES } from '../../constants/task-statuses'
import { State } from '../../store/types'
import { getDraggedTaskOrder } from '../../utils/calendar'
import { useState } from 'react'
import { editTask } from '../../store/entities/task/thunks/edit-task'

interface TasksContainerProps {
    status?: string
    dueDate?: string
    emptyText?: string
}

export function TasksContainer({ status, dueDate, emptyText }: TasksContainerProps) {
    const [draggedTaskOrder, setDraggedTaskOrder] = useState<number | null>(null)
    const dispatch = useDispatch()
    let selector

    switch (status) {
        case TASK_STATUSES.unplanned:
            selector = selectUnplannedTaskIds
            break
        case TASK_STATUSES.planned:
            selector = (state: State) => selectTaskIdsByDueDate(state, dueDate ?? new Date().toISOString())
            break
        case TASK_STATUSES.completed:
            selector = selectTaskIds
            break
        default:
            selector = selectTaskIds
    }

    const taskIds = useSelector(selector)
    const isLoading = useSelector(selectTaskLoadingStatus) === REQUEST_STATUSES.pending

    const onDragOver = (event: React.DragEvent) => {
        event.preventDefault()

        const newDraggedTaskOrder = getDraggedTaskOrder(event)

        if (newDraggedTaskOrder !== draggedTaskOrder) {
            setDraggedTaskOrder(newDraggedTaskOrder)
        }
    }
    const onDragLeave = () => setDraggedTaskOrder(null)
    const onDrop = (event: React.DragEvent) => {
        const taskId = event.dataTransfer.getData('text/plain')

        if (taskId) {
            dispatch(editTask({
                id: taskId,
                dueDate: dueDate,
                order: draggedTaskOrder,
            }))
            event.dataTransfer.setData('text/plain', '')
            setDraggedTaskOrder(null)
        }
    }

    return (
        isLoading
            ? 'Загрузка...'
            : <Tasks
                taskIds={taskIds}
                emptyText={emptyText}
                draggedTaskOrder={draggedTaskOrder}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            />
    )
}
