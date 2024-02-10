import { useDispatch } from 'react-redux'
import { editTask } from '../../store/entities/task/thunks/edit-task'
import { Day } from '../../types'
import { CalendarWeekDay } from './component'
import { useContext } from 'react'
import { DragAndDropContext } from '../../contexts/drag-and-drop/context'

export function CalendarWeekDayContainer ({ day }: { day: Day }) {
    const { draggedTaskId, setDraggedTaskId } = useContext(DragAndDropContext)
    const dispatch = useDispatch()

    const onDragOver = (event: React.DragEvent) => {
        event.preventDefault()
        console.log('onDragOver', event.target.closest('[data-taskid]')?.ariaRowIndex)

    }
    const onDrop = () => {
        dispatch(editTask({
            id: draggedTaskId,
            dueDate: day.date,
        }))
        setDraggedTaskId(null)
    }

    return <CalendarWeekDay onDragOver={onDragOver} onDrop={onDrop} day={day} />
}
