import { useDispatch, useSelector } from 'react-redux'
import { selectTaskIds, selectTaskLoadingStatus } from '../../store/entities/task/selectors'
import { useEffect } from 'react'
import { getTasks } from '../../store/entities/task/thunks/get-tasks'
import { Tasks } from './component'
import { REQUEST_STATUSES } from '../../constants/request-statuses'

export function TasksContainer () {
    const taskIds = useSelector(selectTaskIds)
    const isLoading = useSelector(selectTaskLoadingStatus) === REQUEST_STATUSES.pending
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getTasks())
    })

    return !isLoading ? <Tasks taskIds={taskIds} /> : 'Загрузка...'
}
