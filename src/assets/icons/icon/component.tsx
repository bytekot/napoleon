import styles from './styles.module.scss'

import classNames from 'classnames'

export function Icon ({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <svg
            className={classNames(styles.icon, className)}
            xmlns='http://www.w3.org/2000/svg'
            width='32'
            height='32'
            fill='#000000'
            viewBox='0 0 256 256'
        >
            {children}
        </svg>
    )
}
