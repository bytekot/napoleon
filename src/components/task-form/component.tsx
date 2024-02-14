import { useState } from 'react'
import { createTask } from '../../store/entities/task/thunks/create-task'
import { useDispatch } from 'react-redux'
import { TextArea } from '../text-area/component'

export function TaskForm() {
    const [taskName, setTaskName] = useState('')
    const dispatch = useDispatch()

    const createNewTask = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && taskName) {
            dispatch(createTask({
                name: taskName,
                creationDate: new Date().toISOString(),
            }))
            setTaskName('')
        }
    }

    return (
        <div>
            <TextArea
                value={taskName}
                onChange={event => setTaskName(event.target.value)}
                onKeyDown={createNewTask}
                emptyText='Что нужно сделать?'
                autoFocus
            />
        </div>
    )
}
