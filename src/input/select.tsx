import { Listbox } from '@headlessui/react'
import { omit } from 'lodash'
import { useState } from 'react'
import { getClasses, InputProps } from '.'
import { Icon, IconName } from '../icon'
import styles from './index.module.css'
import SelectOptions from './select-options'

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
  align?: 'start' | 'end'
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

  const { native = false } = props
  if (native || hasIcon) {
    return (
      <Listbox value={selected} onChange={setSelected}>
        <span className="inline-block relative w-40">
          <Listbox.Button
            className={getClasses(
              props,
              'states w-full flex items-center justify-between',
              styles.select
            )}
          >
            <span class="truncate">{props.options[selected].name}</span>
            <Icon name="chevron.up.chevron.down" class="pl-2 text-medium" />
          </Listbox.Button>

          <SelectOptions {...props} />
        </span>
      </Listbox>
    )
  }
  return (
    <select
      {...omit(props, 'type', 'filled', 'outlined', 'options', 'native')}
      class={getClasses(
        props,
        'states bg-states',
        styles.chevron,
        styles.select
      )}
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
