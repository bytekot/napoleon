import { useSelector } from 'react-redux'
import { selectTaskIds, selectTaskIdsByDueDate, selectTaskLoadingStatus, selectUnplannedTaskIds } from '../../store/entities/task/selectors'
import { Tasks } from './component'
import { REQUEST_STATUSES } from '../../constants/request-statuses'
import { TASK_STATUSES } from '../../constants/task-statuses'
import { State } from '../../store/types'

export function TasksContainer({ status, dueDate }: { status?: string, dueDate?: string }) {
    let selector

    switch (status) {
        case TASK_STATUSES.unplanned:
            selector = selectUnplannedTaskIds
            break
        case TASK_STATUSES.planned:
            selector = (state: State) => selectTaskIdsByDueDate(state, dueDate || new Date().toISOString())
            break
        case TASK_STATUSES.completed:
            selector = selectTaskIds
            break
        default:
            selector = selectTaskIds
    }

    const taskIds = useSelector(selector)
    const isLoading = useSelector(selectTaskLoadingStatus) === REQUEST_STATUSES.pending

    return !isLoading ? <Tasks taskIds={taskIds} /> : 'Загрузка...'
}
