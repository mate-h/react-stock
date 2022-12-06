import { omit } from 'lodash'
import { useRef, useState } from 'react'
import { getClasses, InputProps } from '.'
import { Icon, IconName } from '../icon'
import styles from './index.module.css'

type SelectOptionName = {
  name: string
}
type SelectOptionIcon = {
  name: string
  icon: IconName
}
export type SelectOption = SelectOptionName | SelectOptionIcon

export type SelectProps = InputProps & {
  options: SelectOptionName[] | SelectOptionIcon[]
  native?: boolean
  selected?: number
  setSelected?: (selected: number) => void
}

export function Select(props: SelectProps) {
  const hasIcon = Boolean(
    props.options.find((n) => {
      const i = n as SelectOptionIcon
      return i.icon
    })
  )
  const [s, setS] = useState(0)
  const selected = props.selected || s
  const setSelected = props.setSelected || setS

  const onChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setSelected(e.target.selectedIndex)
  }

  const { native = true } = props
  if (!native || hasIcon) {
    return <button class={getClasses(props)} />
  }
  return (
    <select
      {...omit(props, 'type', 'filled', 'outlined', 'options')}
      class={getClasses(props, 'states bg-states', styles.select)}
      onChange={onChange}
      value={selected}
    >
      {props.options.map((option, i) => (
        <option value={i} key={i}>
          {option.name}
        </option>
      ))}
    </select>
  )
}
