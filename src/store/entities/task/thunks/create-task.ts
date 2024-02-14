import { createAsyncThunk } from '@reduxjs/toolkit'
import { Task } from '../../../../types'

export const createTask = createAsyncThunk('task/createTask',
    async (params: { name: string, creationDate: string }, { rejectWithValue }) => {
        const response = await fetch('http://localhost:3001/api/task', {
            method: 'POST',

            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(params),
        })

        const task = await response.json() as Task | null

        if (!task) {
            rejectWithValue('Something went wrong.')
        }

        return task
    }
)
