import { useDispatch } from 'react-redux'
import { TasksForm } from './component'
import { AppDispatch } from '../../store'
import { useState } from 'react'
import { createTask } from '../../store/entities/task/thunks/create-task'

import styles from './styles.module.scss'
import classNames from 'classnames'

export function TasksFormContainer ({ className }: { className?: string }) {
    const [taskName, setTaskName] = useState('')
    const [minimized, setMinimized] = useState(false)
    const dispatch = useDispatch<AppDispatch>()

    function createNewTask (event: React.KeyboardEvent) {
        if (event.key === 'Enter' && taskName) {
            dispatch(createTask({
                name: taskName,
                creationDate: new Date().toISOString(),
            }))
            setTaskName('')
        }
    }

    return (
        <TasksForm
            className={classNames(className, {
                [styles.minimized]: minimized,
            })}
            onMinimizeButtonClick={() => setMinimized(minimized =>!minimized)}
            inputValue={taskName}
            onInputKeyDown={createNewTask}
            onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => setTaskName(event.target.value)}
            minimized={minimized}
        />
    )
}
