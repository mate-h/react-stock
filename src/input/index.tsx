import { omit } from 'lodash'
import { classes } from '../classes'
import styles from './index.module.css'

export type InputProps = {
  type?: 'filled' | 'outlined'
  filled?: string
  outlined?: string
  class?: string
  className?: string
}

export type Props = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> &
  InputProps

export function getClasses(props: InputProps,...moreClasses: (string|boolean|undefined)[]) {
  const { type = 'filled', filled, outlined } = props
  return classes(
    styles.main,
    type === 'outlined' && (outlined || styles.outlined),
    type === 'filled' && (filled || styles.filled),
    props.class,
    props.className,
    ...moreClasses
  )
}

export default function (props: Props) {
  return (
    <input
      class={getClasses(props)}
      {...omit(props, 'type', 'filled', 'outlined')}
    />
  )
}
