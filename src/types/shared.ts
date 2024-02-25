import { SIZES } from '../constants/shared'

export type Size = keyof typeof SIZES

export interface IconProps {
    className?: string
    size?: Size
}
