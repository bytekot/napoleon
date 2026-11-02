import { DAYS_OF_WEEK } from '../../constants/calendar'
import { CalendarDayContainer } from '../calendar-day/container'
import { TasksContainer } from '../tasks/container'

import styles from './styles.module.scss'
import classNames from 'classnames'

interface CalendarMonthProps {
    dates: Date[]
    className?: string
    dateTime: string
}

export function CalendarMonth ({ dates, className, dateTime }: CalendarMonthProps) {
    return (
        <time
            dateTime={dateTime}
            className={classNames(styles.calendarMonth, className)}
        >
            {
                DAYS_OF_WEEK.map((day, index) =>
                    <div key={index} className={styles.dayOfWeek}>{day}</div>
                )
            }
            {
                dates.map((date: Date, index: number) =>
                    <CalendarDayContainer key={index} className={styles.day} date={date}>
                        <TasksContainer
                            dueDate={`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`}
                            className={styles.tasks}
                            // onItemDragStart={onItemDragStart}
                        />
                    </CalendarDayContainer>
                )
            }
        </time>
    )
}
