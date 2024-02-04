interface TextField {
    className?: string
    value?: string
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
    emptyText?: string
}

export const TextField = ({
    value,
    onChange,
    emptyText,
} : TextField) => (

    <input
        type='text'
        value={value}
        onChange={onChange}
        placeholder={emptyText}
    />
)
