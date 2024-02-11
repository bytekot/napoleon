import { DAY_NAMES } from '../constants/calendar'

export function getWeekData () {
    const now = new Date()
    const today = now.getDay()
    const currentDate = now.getDate()

    return DAY_NAMES.map((day, index) => {
        const date = currentDate - (today - index - 1) - 7

        return {
            day,
            date: `${now.getFullYear()}-${now.getMonth()}-${date}`,
            isToday: currentDate === date,
        }
    })
}
