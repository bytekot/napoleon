import { useCalendar } from '../calendar/hooks'
import { Button } from '../button/component'

import styles from './styles.module.scss'

import classNames from 'classnames'

export function CalendarPeriodControls ({ className }: { className?: string }) {
    const { date, setDate } = useCalendar()

    // todo: use hook
    const moveDate = (additionalDays: number) => {
        const currentDate = new Date(date)

        currentDate.setDate(currentDate.getDate() + additionalDays)
        setDate(currentDate)
    }
    const onButtonNextClick = () => moveDate(7)
    const onButtonPreviousClick = () => moveDate(-7)
    const onButtonTodayClick = () => setDate(new Date())

    return (
        <div className={classNames(styles.calendarPeriodControls, className)}>
            <Button onClick={onButtonPreviousClick}>{'<'}</Button>
            <Button onClick={onButtonTodayClick}>{'Сегодня'}</Button>
            <Button onClick={onButtonNextClick}>{'>'}</Button>
        </div>
    )
}
