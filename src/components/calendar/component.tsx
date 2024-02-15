import { CALENDAR_VIEWS } from '../../constants/calendar'
import { CalendarHeader } from '../calendar-header/component'
import { CalendarMonthContainer } from '../calendar-month/container'
import { CalendarWeekContainer } from '../calendar-week/container'
import { useCalendar } from './hooks'

import styles from './styles.module.scss'

import classNames from 'classnames'

export function Calendar ({ className }: { className?: string }) {
    const { view, date, setView } = useCalendar()
    const headerText = function () {
        const month = date.toLocaleString('ru', { month: 'long' })

        return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${date.getFullYear()}`
    }()

    setView(CALENDAR_VIEWS.month)

    return (
        // todo: add datetime attr
        <time className={classNames(styles.calendar, className)}>
            <CalendarHeader className={styles.header} text={headerText}  />
            {
                view !== CALENDAR_VIEWS.week || <CalendarWeekContainer className={styles.week} />
            }
            {
                view !== CALENDAR_VIEWS.month || <CalendarMonthContainer className={styles.month} />
            }
        </time>
    )
}
