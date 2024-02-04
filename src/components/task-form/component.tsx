import { useState } from 'react'
import { Button } from '../button/component'
import { TextField } from '../text-field/component'
import { createTask } from '../../store/entities/task/thunks/create-task'
import { useDispatch } from 'react-redux'

export function TaskForm() {
    const [taskName, setTaskName] = useState('')
    const dispatch = useDispatch()

    const create = () => {
        dispatch(createTask({taskName}))
        setTaskName('')
    }

    return (
        <div>
            <TextField value={taskName} onChange={event => setTaskName(event.target.value)} />
            <Button onClick={create}>Добавить</Button>
        </div>
    )
}
