import { CaretLeftIcon } from '../../assets/icons/caret-left/component'
import { CaretRightIcon } from '../../assets/icons/caret-right/component'
import { SIZES } from '../../constants/shared'
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
    return (
        <div className={classNames(styles.calendarDateControls, className)}>
            <Button onClick={onPreviousBtnClick}>
                <CaretLeftIcon size={SIZES.small} />
            </Button>
            <Button onClick={onTodayBtnClick}>{'Сегодня'}</Button>
            <Button onClick={onNextBtnClick}>
                <CaretRightIcon size={SIZES.small} />
            </Button>
        </div>
    )
}
