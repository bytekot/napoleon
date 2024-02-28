import { getWeekDayDates } from '../../utils/calendar'
import { CalendarDayContainer } from '../calendar-day/container'
import { TasksContainer } from '../tasks/container'

import styles from './styles.module.scss'
import classNames from 'classnames'

interface CalendarWeekProps {
    date: Date
    className?: string
    onItemDragStart?: (id: string, event: React.DragEvent) => void
}

export function CalendarWeek ({ date, className, onItemDragStart }: CalendarWeekProps) {
    return (
        // todo add datetime attr
        <time className={classNames(styles.calendarWeek, className)}>
            {
                getWeekDayDates(date).map((date, index) =>
                    <CalendarDayContainer
                        key={index}
                        date={date}
                        className={styles.day}
                    >
                        <TasksContainer
                            dueDate={`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`}
                            className={styles.tasks}
                            onItemDragStart={onItemDragStart}
                        />
                    </CalendarDayContainer>
                )
            }
        </time>
    )
}
