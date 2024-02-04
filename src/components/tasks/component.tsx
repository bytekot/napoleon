import { TaskContainer } from '../task/container'

export function Tasks ({taskIds}: {taskIds: string[]}) {
    return (
        <div>
            {
                taskIds.map((taskId: string) => (
                    <TaskContainer key={taskId} taskId={taskId} />
                ))
            }
        </div>
    )
}
