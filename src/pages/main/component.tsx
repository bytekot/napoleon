import { useDispatch } from 'react-redux'
import { CalendarWeek } from '../../components/calendar-week/component'
import { TaskForm } from '../../components/task-form/component'
import { TasksContainer } from '../../components/tasks/container'
import { TASK_STATUSES } from '../../constants/task-statuses'
import { useEffect } from 'react'
import { getTasks } from '../../store/entities/task/thunks/get-tasks'

export function MainPage () {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getTasks())
    })

    return (
        <div>
            <TaskForm />
            <TasksContainer status={TASK_STATUSES.unplanned} />
            <CalendarWeek />
        </div>
    )
}
