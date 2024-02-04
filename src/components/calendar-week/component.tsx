import { DAYS } from '../../constants/calendar'
import { CalendarWeekDay } from '../calendar-week-day/component'
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
        <div className={styles.root}>
            {
                week.map(day => <CalendarWeekDay key={day.date} day={day} />)
            }
        </div>
    )
}
