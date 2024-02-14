import { configureStore } from '@reduxjs/toolkit'
import { taskSlice } from './entities/task'

const store = configureStore({
    reducer: {
        task: taskSlice.reducer
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware(),
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export default store
