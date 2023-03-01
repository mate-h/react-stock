import { CandleData, Chart, Source } from './chart'
import Palette from './chart/palette'
import { getCandles, useFinnhub } from './finnhub'
import { Icon } from './icon'
import Input from './input'
import { Select } from './input/select'
import Menu from './input/menu'
import Tabs from './tabs'
import Picker from './input/picker'
import { atom, useAtom } from 'jotai'

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

const Demo = () => {
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

export const viewModeAtom = atom('candles')
const VideModes = () => {
  const [viewMode, setViewMode] = useAtom(viewModeAtom)
  return (
    <Tabs
      tabs={[{ name: 'Candles' }, { name: 'Lines' }]}
      onChange={(index) => setViewMode(index === 0 ? 'candles' : 'lines')}
    />
  )
}

function App() {
  const { subscribe } = useFinnhub()
  return (
    <main class="flex flex-col h-full">
      <header>
        <nav class="flex bg-well border-b border-divider relative z-10 space-x-2 px-2">
          <h1 class="font-mono text-sm flex items-center">
            <a href="/">📈 react-stock</a>
          </h1>
          <div class="flex-1">
            <VideModes />
          </div>
          <a
            href="https://github.com/mate-h/react-stock"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center"
          >
            <img
              src="./github.svg"
              class="inline w-6 h-6 filter invert"
              alt="github"
            />
          </a>
        </nav>
      </header>
      <section class="container mx-auto p-6 space-y-6 flex-1">
        <div class="relative h-full">
          <Chart>
            <Source getCandles={getCandles} subscribe={subscribe} />
            <CandleData />
          </Chart>
        </div>
      </section>
    </main>
  )
}

export default App
