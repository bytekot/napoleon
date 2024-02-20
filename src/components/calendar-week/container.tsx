import { useCalendar } from '../calendar/hooks'
import { CalendarWeek } from './component'

export function CalendarWeekContainer ({ className }: { className?: string }) {
    const { date, setMovingItem } = useCalendar()

    function onItemDragStart (id: string, event: React.DragEvent) {
        setMovingItem && setMovingItem({ id, element: event.target })
    }

    return (
        <CalendarWeek
            date={date}
            className={className}
            onItemDragStart={onItemDragStart}
        />
    )
}
