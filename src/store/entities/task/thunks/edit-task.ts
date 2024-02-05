import { createAsyncThunk } from '@reduxjs/toolkit'
import { Task } from '../../../../types'

export const editTask = createAsyncThunk('task/editTask',
    async ({id, dueDate}: {id: string, dueDate: string}) => {
        const response = await fetch(`http://localhost:3001/api/task${id}`, {
            method: 'PATCH',

            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                dueDate: dueDate,
            })
        })
        const task: Task = await response.json()

        return task
    }
)
