import { useCalendar } from '../calendar/hooks'
import { Button } from '../button/component'
import { CALENDAR_VIEWS } from '../../constants/calendar'

import styles from './styles.module.scss'

import classNames from 'classnames'

export function CalendarPeriodControls ({ className }: { className?: string }) {
    const { date, setDate, view, setView } = useCalendar()

    // todo: use hook
    const previousWeek = () => setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7))
    const nextWeek = () => setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7))
    const previousMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() - 1, date.getDate()))
    const nextMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() + 1, date.getDate()))
    const today = () => setDate(new Date())
    const showWeek = () => setView(CALENDAR_VIEWS.week)
    const showMonth = () => setView(CALENDAR_VIEWS.month)

    return (
        <div className={classNames(styles.calendarPeriodControls, className)}>
            <Button onClick={showWeek}>{'Неделя'}</Button>
            <Button onClick={showMonth}>{'Месяц'}</Button>

            <Button onClick={view === CALENDAR_VIEWS.week ? previousWeek : previousMonth}>{'<'}</Button>
            <Button onClick={today}>{'Сегодня'}</Button>
            <Button onClick={view === CALENDAR_VIEWS.week ? nextWeek : nextMonth}>{'>'}</Button>
        </div>
    )
}
