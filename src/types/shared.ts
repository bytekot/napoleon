export type Size = 'small' | 'medium'

/**
 * Props для иконок.
 *
 * Примечание: `class` не включён в интерфейс, т.к. во Vue это fallthrough-атрибут.
 * Передавайте `class` напрямую в шаблоне: `<CaretLeft class="my-class" />`.
 * Он автоматически применится к корневому SVG-элементу через BaseIcon.
 */
export interface IconProps {
  size?: Size
}
