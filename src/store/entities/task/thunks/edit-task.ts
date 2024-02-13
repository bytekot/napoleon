import { createAsyncThunk } from '@reduxjs/toolkit'
import { Task } from '../../../../types'

export const editTask = createAsyncThunk('task/editTask',
    async (task: Task) => {
        const response = await fetch(`http://localhost:3001/api/task${task.id}`, {
            method: 'PATCH',

            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(task),
        })
        const editedTask: Task = await response.json()

        return editedTask
    }
)
