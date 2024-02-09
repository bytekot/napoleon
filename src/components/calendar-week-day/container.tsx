import { useDispatch } from 'react-redux'
import { editTask } from '../../store/entities/task/thunks/edit-task'
import { Day } from '../../types'
import { CalendarWeekDay } from './component'

export function CalendarWeekDayContainer ({ day }: { day: Day }) {
    const dispatch = useDispatch()
    const onDragOver = (event: React.DragEvent) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }
    const onDrop = (event: React.DragEvent) => {
        dispatch(editTask({
            id: event.dataTransfer.getData('taskId'),
            dueDate: day.date,
        }))
    }

    return (
        <div onDrop={onDrop} onDragOver={onDragOver}>
            <CalendarWeekDay day={day} />
        </div>
    )
}
