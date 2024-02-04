import { createAsyncThunk } from '@reduxjs/toolkit'
import { Task } from '../../../../types'

export const createTask = createAsyncThunk('task/createTask',
    async ({ taskName }: { taskName: string }, { rejectWithValue }) => {
        const response = await fetch('http://localhost:3001/api/task', {
            method: 'POST',

            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                name: taskName,
            })
        })
        const task: Task = await response.json()

        if (!task) {
            rejectWithValue('Something went wrong.')
        }

        return task
    }
)
