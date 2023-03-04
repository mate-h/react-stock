import { Listbox, Transition } from '@headlessui/react'
import { omit } from 'lodash'
import { Fragment, useState } from 'react'
import { getClasses, InputProps } from '.'
import { classes } from '../classes'
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
            <span className="truncate">{props.options[selected].name}</span>
            <Icon name="chevron.up.chevron.down" className="pl-2 text-medium" />
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className={styles.listbox}>
              {props.options.map((option, i) => (
                <Listbox.Option
                  key={i}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-primary-700 text-white' : 'text-medium'
                    }`
                  }
                  value={i}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {option.name}
                      </span>
                      {selected ? (
                        <span
                          className={classes(
                            active ? 'text-white' : 'text-primary',
                            'absolute inset-y-0 left-0 flex items-center pl-3'
                          )}
                        >
                          <Icon
                            name="checkmark"
                            className="mr-2"
                            aria-hidden="true"
                          />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </span>
      </Listbox>
    )
  }
  return (
    <select
      {...omit(props, 'type', 'filled', 'outlined', 'options', 'native')}
      className={getClasses(
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
