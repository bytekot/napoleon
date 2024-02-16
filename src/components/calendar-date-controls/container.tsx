import { useCalendar } from '../calendar/hooks'
import { CalendarDateControls } from './component'

export function CalendarDateControlsContainer ({ className }: { className?: string }) {
    const { setNextDate, setPreviousDate, setToday } = useCalendar()

    return (
        <CalendarDateControls
            className={className}
            onPreviousBtnClick={setPreviousDate}
            onTodayBtnClick={setToday}
            onNextBtnClick={setNextDate}
        />
    )
}
