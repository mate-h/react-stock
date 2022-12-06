import { Chart, Source } from './chart'
import Palette from './chart/palette'
import { getCandles } from './finnhub'
import { Icon } from './icon'
import Input from './input'
import Button from './input/button'
import { Select } from './input/select'
import Menu from './input/menu'
import Tabs from './tabs'

function Stuff() {
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

function App() {
  const mockOptions = [
    { name: 'Option 1' },
    { name: 'Option 2' },
    { name: 'Option 3' },
  ]
  const mockTabs = [{ name: 'Tab 1' }, { name: 'Tab 2' }, { name: 'Tab 3' }]
  return (
    <main class="container mx-auto p-6 space-y-6 h-full">
      <h1 class="font-mono text-xl">📈 react-stock</h1>
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
        <Button primary>Push me</Button>
        <Tabs tabs={mockTabs} />
        <Menu options={mockTabs}/>
      </section>

      <Chart>
        <Source getCandles={getCandles} />
      </Chart>
    </main>
  )
}

export default App
