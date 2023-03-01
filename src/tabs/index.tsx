import { Tab } from '@headlessui/react'
import { classes } from '../classes'
import { IconName } from '../icon'

type TabType = { name: string } // | {name: string; icon: IconName}

type Props = {
  id?: string
  tabs: TabType[]
  onChange?: (index: number) => void
}

export default (props: Props) => {
  return (
    <Tab.Group onChange={props.onChange}>
      <Tab.List
        as="span"
        id={props.id}
        className="whitespace-nowrap inline-block space-x-1 rounded-xl p-1"
      >
        {props.tabs.map((tab, i) => (
          <Tab
            key={i}
            className={({ selected }) =>
              classes(
                'h-10 sm:h-8 text-sm font-medium px-2',
                'rounded-lg rounded-b-none focus:outline-none focus:bg-well',
                selected
                  ? 'text-primary border-bottom-2 border-primary'
                  : 'text-medium hover:text-label'
              )
            }
          >
            {tab.name}
          </Tab>
        ))}
      </Tab.List>
    </Tab.Group>
  )
}
