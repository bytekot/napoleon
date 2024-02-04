import { TaskForm } from '../../components/task-form/component'
import { TasksContainer } from '../../components/tasks/container'

export function MainPage () {
    return (
        <div>
            <TaskForm />
            <TasksContainer />
        </div>
    )
}
