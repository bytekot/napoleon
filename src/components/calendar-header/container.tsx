import { CALENDAR_PERIODS } from '../../constants/calendar'
import { useCalendar } from '../calendar/hooks'
import { CalendarHeader } from './component'

import styles from './styles.module.scss'

import classNames from 'classnames'

export function CalendarHeaderContainer ({ className, text }: { className?: string, text?: string }) {
    const { isPeriodMonth, setPeriod, movingItem } = useCalendar()
    const onDragEnter = () => {
        setTimeout(() => setPeriod(
            isPeriodMonth ? CALENDAR_PERIODS.week : CALENDAR_PERIODS.month
        ), 100)
    }

    return (
        <CalendarHeader
            className={classNames(className, {
                [styles.hoverActionAvailable]: !!movingItem,
            })}
            text={text}
            onDragEnter={onDragEnter}
        />
    )
}
