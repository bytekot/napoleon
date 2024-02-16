import { Button } from '../button/component'

import styles from './styles.module.scss'

import classNames from 'classnames'

interface CalendarPeriodControlsProps {
    className?: string
    onWeekBtnClick: () => void
    onMonthBtnClick: () => void
}

export function CalendarPeriodControls ({ className, onWeekBtnClick, onMonthBtnClick }: CalendarPeriodControlsProps) {
    return (
        <div className={classNames(styles.calendarPeriodControls, className)}>
            <Button onClick={onWeekBtnClick}>{'Неделя'}</Button>
            <Button onClick={onMonthBtnClick}>{'Месяц'}</Button>
        </div>
    )
}
