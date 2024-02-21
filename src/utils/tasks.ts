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
    const tasksEl = element.closest('[data-tasks]')
    const taskEl = element.closest('[data-task]')

    if (tasksEl && taskEl) {
        const { y, height } = taskEl.getBoundingClientRect()
        const order = getNodeIndex(taskEl, tasksEl.childNodes) ?? 0

        return (
            clientY < y + height / 2
                ? order
                : order + 1
        )
    }

    return tasksEl?.childElementCount ?? 0
}
