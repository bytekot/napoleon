export function getWeekDayDates (date: Date): Date[] {
    const monday = getThisMonday(date)

    return Array.from({ length: 7 }, (_, index) =>
        new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index)
    )
}

export function getMonthWeekDates (date: Date): Date[] {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)

    return Array.from({ length: 5 }, (_, index) =>
        new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + index * 7)
    )
}

export function getThisMonday (now: Date) {
    const day = now.getDay()

    if (day === 1) return now

    const date = now.getDate()
    const month = now.getMonth()
    const year = now.getFullYear()

    return new Date(year, month, date - (day - 1))
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
            event.clientY < y + height / 2
                ? order
                : order + 1
        )
    }

    return tasksEl?.childElementCount ?? 0
}
