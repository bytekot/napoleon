import { useDispatch } from 'react-redux'
import { CalendarProvider } from '../../components/calendar/context'
import { CalendarContainer } from '../../components/calendar/container'
import { TaskForm } from '../../components/task-form/component'
import { TasksContainer } from '../../components/tasks/container'
import { useEffect } from 'react'
import { getTasks } from '../../store/entities/task/thunks/get-tasks'
import { Layout } from '../../components/layout/component'
import { AppDispatch } from '../../store'
import { CALENDAR_PERIODS } from '../../constants/calendar'

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
                    <TasksContainer emptyText='Список дел пуст.' />
                </div>
                <CalendarProvider date={new Date()} period={CALENDAR_PERIODS.week}>
                    <CalendarContainer className={styles.calendar}
                />
                </CalendarProvider>
            </div>
        </Layout>
    )
}
