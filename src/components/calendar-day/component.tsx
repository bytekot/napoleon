import styles from './styles.module.scss'

import classNames from 'classnames'

export function CalendarDay ({ children, date, className }: { children?: React.ReactNode, date: Date, className?: string }) {
    return (
        <time
            className={classNames(styles.calendarWeekDay, className, {
                [styles.today]: new Date().toDateString() === date.toDateString(),
            })}
        >
            <div className={styles.header}>
                <h2>{date.getDate()} </h2>
                <span>
                    {date.toLocaleDateString('ru', { weekday: 'short' })}
                    {/* {
                        isPeriodWeek
                            ? date.toLocaleDateString('ru', { weekday: 'short' })
                            : getMonthName(date)
                    } */}
                </span>
            </div>
            {children}
        </time>
    )
}
