import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../store'
import { CALENDAR_PERIODS } from '../../constants/calendar'
import { useCalendar } from '../calendar/hooks'
import { CalendarHeader } from './component'
import { deleteTask } from '../../store/entities/task/thunks/delete-task'

import styles from './styles.module.scss'

import classNames from 'classnames'

export function CalendarHeaderContainer ({ className, text }: { className?: string, text?: string }) {
    const { isPeriodMonth, setPeriod, movingItemId } = useCalendar()
    const dispatch = useDispatch<AppDispatch>()

    const togglePeriod = () => {
        setTimeout(() => setPeriod(
            isPeriodMonth ? CALENDAR_PERIODS.week : CALENDAR_PERIODS.month
        ), 200)
    }
    const deleteItem = (event: React.DragEvent) => {
        const id = event.dataTransfer.getData('text/plain')

        if (id && typeof id === 'string') {
            dispatch(deleteTask(id))
            event.dataTransfer.setData('text/plain', '')
        }
    }

    return (
        <CalendarHeader
            className={classNames(className, {
                [styles.dndMode]: !!movingItemId,
            })}
            text={text}
            onTogglePeriodEnter={togglePeriod}
            onDeleteDrop={deleteItem}
        />
    )
}
