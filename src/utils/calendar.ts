import { DAY_NAMES } from '../constants/calendar'

export function getWeekData () {
    const now = new Date()
    const today = now.getDay()
    const currentDate = now.getDate()

    return DAY_NAMES.map((day, index) => {
        const date = currentDate - (today - index - 1)

        return {
            day,
            date: `${now.getFullYear()}-${now.getMonth()}-${date}`,
            isToday: currentDate === date,
        }
    })
}

function getNodeIndex (element: Element, nodes: NodeList): number | null {
    let order

    nodes.forEach((node, index) => {
        if (node === element) {
            order = index
            return
        }
    })

    return order ?? null
}

export function getDraggedTaskOrder (event: DragEvent & { target: Element }): number {
    const tasksEl = event.target.closest('[data-tasks]')
    const taskEl = event.target.closest('[data-task]')

    if (tasksEl && taskEl) {
        const { y, height } = taskEl.getBoundingClientRect()
        const order = getNodeIndex(taskEl, tasksEl.childNodes) ?? 0

        return (
            event.clientY < y + height/2
                ? order
                : order + 1
        )
    }

    return tasksEl?.childElementCount ?? 0
}
