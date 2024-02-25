import { CALENDAR_PERIODS } from '../../constants/calendar'
import { useCalendar } from '../calendar/hooks'
import { CalendarPeriodControls } from './component'

export function CalendarPeriodControlsContainer ({ className }: { className?: string }) {
    const { setPeriod } = useCalendar()

    return (
        <CalendarPeriodControls
            className={className}
            onWeekBtnClick={() => setPeriod(CALENDAR_PERIODS.week)}
            onMonthBtnClick={() => setPeriod(CALENDAR_PERIODS.month)}
            onYearBtnClick={() => setPeriod(CALENDAR_PERIODS.year)}
        />
    )
}
