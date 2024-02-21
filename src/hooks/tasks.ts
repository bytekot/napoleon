import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { selectTaskById, selectTaskIdsByDueDate, selectTaskLoadingStatus, selectUnplannedTaskIds } from '../store/entities/task/selectors'
import { REQUEST_STATUSES } from '../constants/request-statuses'
import { Task } from '../types/tasks'
import { useState } from 'react'
import { getDraggedTaskOrder } from '../utils/tasks'

export function useTasks (dueDate?: string) {
    const selector = !dueDate
        ? selectUnplannedTaskIds
        : (state: RootState) => selectTaskIdsByDueDate(state, dueDate)

    const taskIds = useSelector(selector)
    const isLoading = useSelector(selectTaskLoadingStatus) === REQUEST_STATUSES.pending

    return {
        taskIds,
        isLoading,
    }
}

export function useTrackTask() {
    const [position, setPosition] = useState<number | null>(null)

    function track(target: Element | null, clientY?: number) {
        if (!target) {
            setPosition(null)
            return
        }

        const currentPosition = getDraggedTaskOrder(target, clientY ?? 0)

        if (currentPosition !== position) {
            setPosition(currentPosition)
        }
    }

    return {
        position,
        track,
    }
}

export function useTask (id: string) {
    const task: Task = useSelector((state: RootState) => selectTaskById(state, id))
    const isLoading = useSelector(selectTaskLoadingStatus) === REQUEST_STATUSES.pending

    return {
        task,
        isLoading,
    }
}
