import styles from './styles.module.scss'

import classNames from 'classnames'

interface ActionAreaProps {
    children?: React.ReactNode
    className?: string
    onDragEnter?: (event: React.DragEvent<HTMLDivElement>) => void
    onDrop?: (event: React.DragEvent<HTMLDivElement>) => void
}

export function ActionArea ({ children, className, onDragEnter, onDrop }: ActionAreaProps) {
    return (
        <div
            className={classNames(styles.actionArea, className)}
            onDragEnter={onDragEnter}
            onDragOver={event => event.preventDefault()}
            onDrop={onDrop}
        >
            {children}
        </div>
    )
}
