import styles from './styles.module.scss'

interface TextArea {
    className?: string
    value?: string
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
    onKeyDown?: (event: React.KeyboardEvent) => void
    emptyText?: string
    autoFocus?: boolean
}

export const TextArea = ({
    value,
    onChange,
    onKeyDown,
    emptyText,
    autoFocus,
}: TextArea) => (

    <input
        type='text'
        className={styles.textArea}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={emptyText}
        autoFocus={autoFocus}
    />
)
