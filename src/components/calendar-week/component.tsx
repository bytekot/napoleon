import { getWeekData } from '../../utils/calendar'
import { CalendarWeekDayContainer } from '../calendar-week-day/container'

import styles from './styles.module.scss'

export function CalendarWeek () {
    return (
        <div className={styles.calendarWeek}>
            {
                getWeekData().map(day => <CalendarWeekDayContainer key={day.date} day={day} />)
            }
        </div>
    )
}
