import { useState } from 'react'
import { createTask } from '../../store/entities/task/thunks/create-task'
import { useDispatch } from 'react-redux'
import { TextArea } from '../text-area/component'

export function TaskForm() {
    const [taskName, setTaskName] = useState('')
    const dispatch = useDispatch()

    const createNewTask = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            dispatch(createTask({ taskName }))
            setTaskName('')
        }
    }

    return (
        <div>
            <TextArea
                value={taskName}
                onChange={event => setTaskName(event.target.value)}
                onKeyDown={createNewTask}
                emptyText='Что будем делать?'
                autoFocus
            />
        </div>
    )
}
