import { DAYS } from '../../constants/calendar'
import { CalendarWeekDayContainer } from '../calendar-week-day/container'
import styles from './styles.module.scss'

export function CalendarWeek () {
    const now = new Date()
    const week = DAYS.map((day, index) => {
        const date = now.getDate() - (now.getDay() - index)

        return {
            day,
            date: `${now.getFullYear()}-${now.getMonth()}-${date}`,
        }
    })

    return (
        <div className={styles.calendarWeek}>
            {
                week.map(day => <CalendarWeekDayContainer key={day.date} day={day} />)
            }
        </div>
    )
}
