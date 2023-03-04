import { omit } from 'lodash'
import { getClasses, InputProps } from '.'
import styles from './index.module.css'

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  InputProps &
  React.PropsWithChildren<{
    primary?: boolean
  }>

export default function (props: Props) {
  return (
    <button
      {...omit(
        props,
        'class',
        'className',
        'primary',
        'type',
        'filled',
        'outlined'
      )}
      className={getClasses(props, 'states', props.primary && styles.primary)}
    >
      {props.children}
    </button>
  )
}
