import { useDispatch } from 'react-redux'
import { CalendarContainer } from '../../components/calendar/container'
import { TaskForm } from '../../components/task-form/component'
import { TasksContainer } from '../../components/tasks/container'
import { TASK_STATUSES } from '../../constants/task-statuses'
import { useEffect } from 'react'
import { getTasks } from '../../store/entities/task/thunks/get-tasks'
import { Layout } from '../../components/layout/component'
import { AppDispatch } from '../../store'

import styles from './styles.module.scss'

export function MainPage () {
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        dispatch(getTasks())
    })

    return (
        <Layout>
            <div className={styles.mainPage}>
                <div className={styles.tasks}>
                    <TaskForm />
                    <TasksContainer
                        status={TASK_STATUSES.unplanned}
                        allowReordering={false}
                        emptyText='А ничего.'
                    />
                </div>
                <CalendarContainer
                    date={new Date()}
                    className={styles.calendar}
                />
            </div>
        </Layout>
    )
}
