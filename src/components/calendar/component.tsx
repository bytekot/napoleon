import { CalendarHeader } from '../calendar-header/component'
import { CalendarWeekContainer } from '../calendar-week/container'
import { CalendarProvider } from './context'

import styles from './styles.module.scss'

export function Calendar ({ date }: { date: Date }) {
    const headerText = function () {
        const month = date.toLocaleString('ru', { month: 'long' })

        return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${date.getFullYear()}`
    }()

    return (
        <CalendarProvider defaultDate={date}>
            <div className={styles.calendar}>
                <CalendarHeader className={styles.header} text={headerText}  />
                <CalendarWeekContainer />
            </div>
        </CalendarProvider>
    )
}
