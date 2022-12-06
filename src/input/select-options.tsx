import { Listbox, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Icon } from '../icon'
import { SelectProps } from './select'
import styles from './index.module.css'

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
                active ? 'bg-well text-primary' : 'text-medium'
              }`
            }
            value={i}
          >
            {({ selected }) => (
              <>
                <span
                  class={`block truncate ${
                    selected ? 'font-medium' : 'font-normal'
                  }`}
                >
                  {option.name}
                </span>
                {selected ? (
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                    <Icon name="checkmark" class="h-5 w-5" aria-hidden="true" />
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
