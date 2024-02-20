import { useState } from 'react'
import { getDraggedTaskOrder } from '../../utils/tasks'

export function useTrackTaskOrder (onDropHandler: (text: string, order: number) => void) {
    const [draggedTaskOrder, setDraggedTaskOrder] = useState<number | null>(null)

    const onDragOver = (event: React.DragEvent) => {
        event.preventDefault()

        const newDraggedTaskOrder = getDraggedTaskOrder(event)

        if (newDraggedTaskOrder !== draggedTaskOrder) {
            setDraggedTaskOrder(newDraggedTaskOrder)
        }
    }
    const onDragLeave = () => setDraggedTaskOrder(null)
    const onDrop = (event: React.DragEvent) => {
        const taskId = event.dataTransfer.getData('text/plain')

        if (taskId && typeof taskId === 'string' && draggedTaskOrder !== null) {
            onDropHandler(taskId, draggedTaskOrder)
            event.dataTransfer.setData('text/plain', '')
            setDraggedTaskOrder(null)
        }
    }
    function onDragStart (id: string, { dataTransfer }: React.DragEvent) {
        dataTransfer.effectAllowed = 'move'
        dataTransfer.setData('text/plain', id)
    }

    return {
        draggedTaskOrder,
        onDragOver,
        onDragLeave,
        onDrop,
        onDragStart,
    }
}
