import styles from './styles.module.scss'

interface Button {
    disabled?: boolean
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
    children?: React.ReactNode
}

export const Button = ({
    disabled = false,
    onClick,
    children,
}: Button) => (

    <button
        className={styles.button}
        disabled={disabled}
        onClick={onClick}
    >
        {children}
    </button>
)
