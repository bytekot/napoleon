export interface Task {
    id: string
    name: string
    dueDate: string | null
    order: number | null
    status?: string
}

export interface Day {
    day: string
    date: string
    isToday?: boolean
}
