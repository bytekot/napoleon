export interface Task {
  id: string
  name: string
  creationDate: string
  dueDate: string | null
  order: number | null
  completed: boolean
}

export interface TaskItemProps {
  task: Task
  draggable?: boolean
}
