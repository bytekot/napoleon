import styles from './styles.module.scss'
import classNames from 'classnames'

export interface CalendarDayProps {
    children?: React.ReactNode
    date: number
    className?: string
    minimized?: boolean
}

// new Date().toISOString().substring(0, 10)

export function CalendarDay ({
    children,
    date,
    className,
    minimized = false,
}: CalendarDayProps
) {
    return (
        <time className={classNames(styles.calendarDay, className, {
            [styles.minimized]: minimized,
        })}>
            <span className={styles.date}>{date}</span>
            {
                !minimized && <div>{children}</div>
            }
        </time>
    )
}
