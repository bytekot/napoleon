import styles from './styles.module.scss'

import classNames from 'classnames'

export interface ActionAreaProps {
    children?: React.ReactNode
    className?: string
    onEnter?: (event: React.DragEvent<HTMLDivElement>) => void
    onLeave?: (event: React.DragEvent<HTMLDivElement>) => void
    onDrop?: (event: React.DragEvent<HTMLDivElement>) => void
    dangerous?: boolean
}

export function ActionArea ({
    children,
    className,
    onEnter,
    onLeave,
    onDrop,
    dangerous = false
}: ActionAreaProps) {
    return (
        <div
            className={classNames(styles.actionArea, className, {
                [styles.dangerous]: dangerous,
            })}
            onDragEnter={onEnter}
            onDragLeave={onLeave}
            onDragOver={event => event.preventDefault()}
            onDrop={onDrop}
        >
            {children}
        </div>
    )
}
