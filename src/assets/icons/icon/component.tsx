import { SIZES } from '../../../constants/shared'
import { IconProps } from '../../../types/shared'

import styles from './styles.module.scss'
import classNames from 'classnames'

export function Icon ({
    children,
    className,
    size,
}: IconProps & {
    children: React.ReactNode
}) {
    return (
        <svg
            className={classNames(styles.icon, className, {
                [styles.small]: size === SIZES.small,
                [styles.medium]: size === SIZES.medium,
            })}
            xmlns='http://www.w3.org/2000/svg'
            width='32'
            height='32'
            fill='#000'
            viewBox='0 0 256 256'
        >
            {children}
        </svg>
    )
}
