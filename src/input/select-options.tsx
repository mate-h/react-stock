import { Listbox, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Icon } from '../icon'
import { SelectProps } from './select'
import styles from './index.module.css'
import { classes } from '../classes'

export default function (props: SelectProps) {
  return (
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
                  class={`block truncate ${
                    selected ? 'font-medium' : 'font-normal'
                  }`}
                >
                  {option.name}
                </span>
                {selected ? (
                  <span
                    class={classes(
                      active ? 'text-white' : 'text-primary',
                      'absolute inset-y-0 left-0 flex items-center pl-3'
                    )}
                  >
                    <Icon name="checkmark" class="mr-2" aria-hidden="true" />
                  </span>
                ) : null}
              </>
            )}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Transition>
  )
}
