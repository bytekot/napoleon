import { createSlice } from '@reduxjs/toolkit'
import { getTasks } from './thunks/get-tasks'
import { REQUEST_STATUSES } from '../../../constants/request-statuses'
import { createTask } from './thunks/create-task'
import { Task } from '../../../types'
import { editTask } from './thunks/edit-task'

type TaskEntities = {
    [key: string]: Task
}

export type TaskState = {
    entities: TaskEntities
    ids: string[]
    status: string
    error: string | null
}

export const taskSlice = createSlice({
    name: 'task',
    initialState: {
        entities: {},
        ids: [],
        status: REQUEST_STATUSES.idle,
        error: null,
    } as TaskState,
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

            .addCase(createTask.fulfilled, (state, { payload }) => {
                state.entities[payload.id] = payload
                state.ids.push(payload.id)
            })

            .addCase(editTask.fulfilled, (state, { payload }) => {
                state.entities[payload.id] = payload
            })
            .addCase(editTask.pending, (state, action) => {
                const params = action.meta.arg

                state.entities[params.id] = { ...state.entities[params.id], ...params}
            })
    },
})
