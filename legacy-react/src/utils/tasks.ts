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

export function getDraggedTaskOrder (element: Element, clientY: number): number {
    const taskListEl = element.closest('[data-task-list]')
    const taskEl = element.closest('[data-task]')

    if (taskListEl && taskEl) {
        const { y, height } = taskEl.getBoundingClientRect()
        const order = getNodeIndex(taskEl, taskListEl.childNodes) ?? 0

        return (
            clientY < y + height / 2
                ? order
                : order + 1
        )
    }

    return taskListEl?.childElementCount ?? 0
}
