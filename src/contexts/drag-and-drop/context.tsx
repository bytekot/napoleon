import { createContext, useState } from 'react'

export const DragAndDropContext = createContext({})

export const DragAndDropProvider = ({ children }: { children: React.ReactNode }) => {
    const [draggedTaskId, setDraggedTaskId] = useState(null)

    return (
        <DragAndDropContext.Provider value={{ draggedTaskId, setDraggedTaskId }}>
            {children}
        </DragAndDropContext.Provider>
    )
}
