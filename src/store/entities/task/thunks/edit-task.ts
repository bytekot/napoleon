import { createAsyncThunk } from '@reduxjs/toolkit'
import { Task } from '../../../../types'

interface TaskParams {
    id: string,
    dueDate?: string,
    order?: number
    status?: string
}

export const editTask = createAsyncThunk('task/editTask',
    async (params: TaskParams, { rejectWithValue }) => {
        const response = await fetch(`http://localhost:3001/api/task${params.id}`, {
            method: 'PATCH',

            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(params),
        })
        const editedTask: Task = await response.json()

        return editedTask
    }
)
