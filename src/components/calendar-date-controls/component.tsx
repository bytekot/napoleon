import { Button } from '../button/component'

import styles from './styles.module.scss'

import classNames from 'classnames'

interface CalendarPeriodControlsProps {
    className?: string
    onPreviousBtnClick: () => void
    onTodayBtnClick: () => void
    onNextBtnClick: () => void
}

export function CalendarDateControls ({
    className,
    onPreviousBtnClick,
    onTodayBtnClick,
    onNextBtnClick,
}: CalendarPeriodControlsProps) {
    console.log('render')
    return (
        <div className={classNames(styles.calendarDateControls, className)}>
            <Button onClick={onPreviousBtnClick}>{'<'}</Button>
            <Button onClick={onTodayBtnClick}>{'Сегодня'}</Button>
            <Button onClick={onNextBtnClick}>{'>'}</Button>
        </div>
    )
}
