import { useState } from 'react'
import { ActionArea, ActionAreaProps } from './component'

import styles from './styles.module.scss'

import classNames from 'classnames'

export function ActionAreaContainer ({ className, onEnter, onLeave, onDrop, ...rest }: ActionAreaProps) {
    const [hovered, setHovered] = useState<boolean>(false)

    const onEnterHandler = (event: React.DragEvent<HTMLDivElement>) => {
        setHovered(true)
        onEnter && onEnter(event)
    }
    const onLeaveHandler = (event: React.DragEvent<HTMLDivElement>) => {
        setHovered(false)
        onLeave && onLeave(event)
    }
    const onDropHandler = (event: React.DragEvent<HTMLDivElement>) => {
        setHovered(false)
        onDrop && onDrop(event)
    }

    return (
        <ActionArea
            className={classNames(className, {
                [styles.active]: hovered,
            })}
            onEnter={onEnterHandler}
            onLeave={onLeaveHandler}
            onDrop={onDropHandler}
            {...rest}
        />
    )
}
