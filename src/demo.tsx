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
      <section className="space-y-2">
        <p className="font-medium space-x-2 text-primary-400">
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
    <div className="space-y-6">
      <div className="flex">
        <h1 className="font-mono text-xl flex-1">📈 react-stock</h1>
        <a
          href="https://github.com/mate-h/react-stock"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="./github.svg"
            className="inline w-6 h-6 filter invert"
            alt="github"
          />
        </a>
      </div>
      <p>
        Fully modular financial charts made from interactive react SVG
        components styled with tailwind css.
      </p>

      <section className="space-x-2">
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
