export type CalendarPeriod = 'week' | 'month' | 'year'

export interface MovingItem {
  id: string
  element: EventTarget | null
}
