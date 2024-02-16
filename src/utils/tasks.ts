function getNodeIndex(element: Element, nodes: NodeList): number | null {
    let order

    nodes.forEach((node, index) => {
        if (node === element) {
            order = index
            return
        }
    })

    return order ?? null
}

export function getDraggedTaskOrder(event: DragEvent & { target: Element }): number {
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
