import styles from './styles.module.scss'
import classNames from 'classnames'

export function CalendarYear ({ className }: { className?: string }) {
    return (
        <div className={classNames(styles.calendarYear, className)}>
        </div>
    )
}
