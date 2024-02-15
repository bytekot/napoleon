export interface Task {
    id: string
    name: string
    creationDate: string
    dueDate: string | null
    order: number | null
    status: string
}
