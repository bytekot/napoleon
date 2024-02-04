import { createSlice } from '@reduxjs/toolkit'
import { Task, getTasks } from './thunks/get-tasks'
import { REQUEST_STATUSES } from '../../../constants/request-statuses'

interface TaskEntities {
    [key: string]: Task
}

export const taskSlice = createSlice({
    name: 'task',
    initialState: {
        entities: {} as TaskEntities,
        ids: [] as string[],
        status: REQUEST_STATUSES.idle,
        error: null as string | null
    },
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getTasks.fulfilled, (state, { payload }) => {
                state.entities = payload.reduce((entities, task) => {
                    entities[task.id] = task

                    return entities
                }, {} as TaskEntities)

                state.ids = payload.map(task => task.id)
                state.status = REQUEST_STATUSES.success
            })
            .addCase(getTasks.rejected, (state, action) => {
                state.error = action.payload as string
                state.status = REQUEST_STATUSES.error
            })
            .addCase(getTasks.pending, state => {
                state.status = REQUEST_STATUSES.pending
            })
    },
})
