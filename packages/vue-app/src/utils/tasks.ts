export function getDraggedTaskOrder (element: Element, clientY: number): number {
    const tasksEl = element.closest('[data-tasks]')
    if (!tasksEl) return 0

    const taskEl = element.closest('[data-task]')
    if (taskEl) {
        const { y, height } = taskEl.getBoundingClientRect()
        const order = Array.from(tasksEl.children).indexOf(taskEl)
        if (order === -1) return tasksEl.childElementCount
        return clientY < y + height / 2 ? order : order + 1
    }

    return tasksEl.childElementCount
}
