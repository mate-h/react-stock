import { Menu, Transition } from '@headlessui/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { Icon, IconName } from '../icon'
import { classes } from '../classes'
import { getClasses, InputProps } from '.'
import styles from './index.module.css'

type MenuOption = {
  name: string
  icon?: IconName
}

type Props = InputProps & {
  side?: 'left' | 'right'
  options: MenuOption[]
  primary?: boolean
}

export default function ({
  side = 'right',
  primary = false,
  options,
  ...props
}: Props) {
  return (
    <Menu as="span" className="relative inline-block">
      <span class="inline-block">
        <Menu.Button
          className={getClasses(props, 'states', primary && styles.primary)}
        >
          Options
          <Icon
            name="chevron.down"
            class="ml-2 text-medium"
            aria-hidden="true"
          />
        </Menu.Button>
      </span>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          as="span"
          className={classes(
            'inline-block absolute mt-10 w-56 divide-y divide-divider rounded-md bg-surface shadow-lg border border-divider focus:outline-none',
            side === 'right' && 'right-0 origin-top-right',
            side === 'left' && 'left-0 origin-top-left'
          )}
        >
          <span class="inline-block px-1 py-1 w-full">
            {options.map((option) => (
              <Menu.Item>
                {({ active }) => (
                  <button
                    class={`${
                      active ? 'bg-primary-700 text-white' : 'text-label'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    {active ? (
                      <Icon
                        name="circle.fill"
                        class="mr-2"
                        aria-hidden="true"
                      />
                    ) : (
                      <Icon name="circle" class="mr-2" aria-hidden="true" />
                    )}
                    {option.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </span>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
