import { createSlice } from '@reduxjs/toolkit'
import { getTasks } from './thunks/get-tasks'
import { REQUEST_STATUSES } from '../../../constants/request-statuses'
import { createTask } from './thunks/create-task'
import { Task } from '../../../types/tasks'
import { editTask } from './thunks/edit-task'
import { deleteTask } from './thunks/delete-task'

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

            .addCase(createTask.fulfilled, (state, { meta, payload }) => {
                const tempId = meta.requestId

                delete state.entities[tempId]
                state.ids = state.ids.filter(id => id!== tempId)

                state.entities[payload.id] = payload
                state.ids.push(payload.id)
            })
            .addCase(createTask.pending, (state, { meta }) => {
                const { name, creationDate } = meta.arg
                const id = meta.requestId

                state.entities[id] = { id, name, creationDate } as Task
                state.ids.push(id)
            })

            .addCase(editTask.fulfilled, (state, { meta, payload }) => {
                if (meta.arg.completed) {
                    return
                }

                if (Array.isArray(payload)) {
                    payload.forEach(entity => {
                        state.entities[entity.id] = entity
                    })
                } else {
                    state.entities[payload.id] = payload
                }
            })
            .addCase(editTask.pending, (state, action) => {
                const params = action.meta.arg

                if (params.order) {
                    state.entities[params.id] = {
                        ...state.entities[params.id],
                        ...params,
                        order: params.order - 0.5
                    }
                } else {
                    state.entities[params.id] = { ...state.entities[params.id], ...params }
                }
            })

            .addCase(deleteTask.pending, (state, action) => {
                const id = action.meta.arg
                const index = state.ids.indexOf(id)

                if (index !== -1) {
                    delete state.entities[id]
                    state.ids = [...state.ids.slice(0, index), ...state.ids.slice(index + 1)]
                }
            })
    },
})
