import { configureStore } from '@reduxjs/toolkit'
import { taskSlice } from './entities/task'

const store = configureStore({
    reducer: {
        task: taskSlice.reducer
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware(),
})

export default store
