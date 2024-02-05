import classNames from 'classnames'

import styles from './styles.module.scss'

export const Header = ({ className }: { className?: string }) => {
    return (
        <div className={classNames(styles.header, className)}>
        </div>
    )
}
