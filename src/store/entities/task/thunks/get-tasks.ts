import { createAsyncThunk } from '@reduxjs/toolkit'
import { selectTaskIds } from '../selectors'

export interface Task {
    id: string
    name: string
}

export const getTasks = createAsyncThunk('task/getTasks',

    async (_, { rejectWithValue }) => {
        const response = await fetch('http://localhost:3001/api/tasks')
        const tasks: Task[] = await response.json()

        if (!tasks?.length) {
            rejectWithValue('No tasks.')
        }

        return tasks
    },
    {
        condition: (_, { getState }) => !selectTaskIds(getState()).length,
    }
)
