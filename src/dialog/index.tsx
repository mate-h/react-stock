import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Icon } from '../icon'
import { classes } from '../classes'
import styles from './index.module.css'

type Props = {
  open: boolean
  onClose?: () => void
  title?: string
  children?: React.ReactNode
  align?: 'top' | 'center' | 'bottom'
  sheet?: boolean
  scale?: boolean
}
export default function ({
  open,
  onClose = () => {},
  title,
  children,
  sheet = false,
  scale = false,
}: Props) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 transition-opacity" />
        </Transition.Child>

        <div class="fixed z-10 inset-0 overflow-y-auto">
          <div
            class={classes(
              'flex justify-center min-h-full p-4',
              sheet && 'p-0 pt-8 sm:p-4 items-start',
              !sheet && 'items-center text-center'
            )}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom={classes(
                'opacity-0',
                sheet && 'translate-y-4',
                scale && 'scale-95'
              )}
              enterTo={classes(
                'opacity-100',
                sheet && 'translate-y-0',
                scale && 'scale-100'
              )}
              leave="ease-in duration-200"
              leaveFrom={classes(
                'opacity-100',
                sheet && 'translate-y-0',
                scale && 'scale-100'
              )}
              leaveTo={classes(
                'opacity-0',
                sheet && 'translate-y-4',
                scale && 'scale-95'
              )}
            >
              <Dialog.Panel
                className={classes(
                  styles.card,
                  'relative px-4 pt-5 pb-4 text-left transform transition-all',
                  sheet && 'w-full sm:max-w-sm',
                  !sheet && 'text-center'
                )}
              >
                <div>
                  {title && (
                    <Dialog.Title className="text-2xl font-bold mb-4 mt-0">
                      {title}
                    </Dialog.Title>
                  )}
                  {children}
                </div>
                <button />
                <div class="mt-5 sm:mt-6 flex justify-center">
                  <button
                    tabIndex={-1}
                    type="button"
                    class="inline-flex justify-center w-36 rounded-xl border border-transparent shadow-sm px-4 py-2 bg-primary-700 text-base font-medium text-white hover:bg-primary-800 sm:text-sm transition-colors duration-75"
                    onClick={onClose}
                  >
                    Close
                    <Icon name="xmark" class="pl-2" />
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
