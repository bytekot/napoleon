import { SIZES } from '../../constants/shared'
import { TextArea } from '../text-area/component'
import { Button } from '../button/component'
import { TasksContainer } from '../tasks/container'
import { TasksIcon } from '../../assets/icons/tasks/component'

import styles from './styles.module.scss'
import classNames from 'classnames'

interface TasksFormProps {
    className?: string
    onMinimizeButtonClick?: () => void
    inputValue?: string,
    onInputKeyDown?: (event: React.KeyboardEvent) => void
    onInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
    minimized?: boolean
}

export function TasksForm ({
    className,
    onMinimizeButtonClick,
    inputValue,
    onInputKeyDown,
    onInputChange,
    minimized = false,
}: TasksFormProps) {

    return (
        <div className={classNames(styles.tasksForm, className)}>
            <div className={styles.header}>
                <Button onClick={onMinimizeButtonClick}>
                    <TasksIcon size={SIZES.small} />
                </Button>
                {minimized || <h1>Список дел</h1>}
            </div>
            {minimized || 
                <>
                    <TextArea
                        value={inputValue}
                        onChange={onInputChange}
                        onKeyDown={onInputKeyDown}
                        emptyText='Что нужно сделать?'
                        autoFocus
                    />
                    <TasksContainer emptyText='Список дел пуст.' />
                </>
            }
        </div>
    )
}
