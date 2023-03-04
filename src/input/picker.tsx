import { useState } from 'react'
import { Icon, IconName } from '../icon'
import { InputProps } from '.'
import Button from './button'
import Dialog from '../dialog'
import { Select } from './select'
import Menu from './menu'

type PickerOption = {
  name: string
  icon?: IconName
}

type Props = InputProps & {
  side?: 'left' | 'right'
  options: PickerOption[]
  primary?: boolean
}

export default (props: Props) => {
  // cross platform picker component

  // TODO: handle resize
  const breakpoint = 640
  if (window.innerWidth >= breakpoint) {
    return <Menu options={props.options} />
  }
  const [dialogOpen, setDialogOpen] = useState(false)
  const [s, setS] = useState(0)
  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>
        Options
        <Icon name="chevron.down" className="ml-2 text-medium" />
      </Button>

      <Dialog
        open={dialogOpen}
        title="Hello"
        scale
        onClose={() => {
          setS(s + 1)
          if (s % 2) setDialogOpen(false)
        }}
      >
        Hello world
      </Dialog>
    </>
  )
}
