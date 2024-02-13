import { getWeekData } from '../../utils/calendar'
import { CalendarWeekDay } from '../calendar-week-day/component'

import styles from './styles.module.scss'

export function CalendarWeek () {
    return (
        <div className={styles.calendarWeek}>
            {
                getWeekData().map(day => <CalendarWeekDay key={day.date} day={day} />)
            }
        </div>
    )
}
