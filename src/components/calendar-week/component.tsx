import { DAY_NAMES } from '../../constants/calendar'
import { CalendarWeekDayContainer } from '../calendar-week-day/container'
import styles from './styles.module.scss'

export function CalendarWeek () {
    const now = new Date()
    const today = now.getDay()
    const currentDate = now.getDate()
    const week = DAY_NAMES.map((day, index) => {
        const date = currentDate - (today - index - 1)

        return {
            day,
            date: `${now.getFullYear()}-${now.getMonth()}-${date}`,
            isToday: currentDate === date,
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
