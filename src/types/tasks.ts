export interface Task {
    id: string
    name: string
    creationDate: string
    dueDate: string | null
    order: number | null
    completed: boolean
}

export interface TaskProps {
    task: Task
    className?: string
    draggable?: boolean
    onCheckChange?: (taskId: string, event: React.ChangeEvent<HTMLInputElement>) => void
    onDragStart?: (taskId: string, event: React.DragEvent) => void
}

export interface TaskContainerProps {
    taskId: string
    className?: string
    onCheckChange?: (taskId: string, event: React.ChangeEvent<HTMLInputElement>) => void
    onDragStart?: (taskId: string, event: React.DragEvent) => void
}
