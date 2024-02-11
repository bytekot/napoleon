export interface Task {
    id: string
    name: string
    dueDate?: string
}

export interface Day {
    day: string
    date: string
    isToday?: boolean
}
