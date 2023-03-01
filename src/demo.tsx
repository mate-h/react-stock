import Palette from './chart/palette'
import { Icon } from './icon'
import Input from './input'
import { Select } from './input/select'
import Menu from './input/menu'
import Tabs from './tabs'
import Picker from './input/picker'

export function Stuff() {
  return (
    <>
      <section class="space-y-2">
        <p class="font-medium space-x-2 text-primary-400">
          <Icon name="lock" />
          <span>Primary 400</span>
        </p>

        <Palette color="primary" />
        <Palette color="green" />
        <Palette color="red" />
      </section>
    </>
  )
}

export const Demo = () => {
  const mockOptions = [
    { name: 'Option 1' },
    { name: 'Option 2' },
    { name: 'Option 3' },
  ]
  const mockTabs = [{ name: 'Tab 1' }, { name: 'Tab 2' }, { name: 'Tab 3' }]
  return (
    <div class="space-y-6">
      <div class="flex">
        <h1 class="font-mono text-xl flex-1">📈 react-stock</h1>
        <a
          href="https://github.com/mate-h/react-stock"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="./github.svg"
            class="inline w-6 h-6 filter invert"
            alt="github"
          />
        </a>
      </div>
      <p>
        Fully modular financial charts made from interactive react SVG
        components styled with tailwind css.
      </p>

      <section class="space-x-2">
        <Input placeholder="Symbol" />
        <Input placeholder="Timeframe" type="outlined" />
        <Select options={mockOptions} />
        <Select options={mockOptions} type="outlined" />
        <Select native options={mockOptions} />
        <Tabs tabs={mockTabs} />
        <Menu options={mockTabs} />
        <Picker options={mockTabs} />
      </section>
    </div>
  )
}
