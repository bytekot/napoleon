import { createAsyncThunk } from '@reduxjs/toolkit'

export const deleteTask = createAsyncThunk('task/deleteTask',
    async (id: string) => {
        await fetch(`http://localhost:3001/api/task${id}`, {
            method: 'DELETE',

            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })

        return id
    }, 
)
