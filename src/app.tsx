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
import { useState } from 'react'

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
export const symbolSearchAtom = atom('BTCUSDT')
const ViewModes = () => {
  const [viewMode, setViewMode] = useAtom(viewModeAtom)
  return (
    <Tabs
      id="view-mode"
      tabs={[{ name: 'Candles' }, { name: 'Lines' }, { name: 'Both' }]}
      onChange={(index) => setViewMode(['candles', 'lines', 'both'][index])}
    />
  )
}

const SearchInput = () => {
  const [search, setSearch] = useAtom(symbolSearchAtom)
  return (
    <Input
      id="symbol"
      placeholder="Search"
      onChange={(e) => setSearch(e.target.value)}
      value={search}
    />
  )
}

function App() {
  const { subscribe } = useFinnhub()

  const Field = ({ children, label, for: htmlFor }: any) => (
    <fieldset>
      <div class="flex items-center space-x-2 max-w-xs">
        <label for={htmlFor} class="text-sm font-medium text-medium flex-1">
          {label}
        </label>
        {children}
      </div>
    </fieldset>
  )
  const [collapsed, setCollapsed] = useState(true)
  function onToggle(e: React.MouseEvent) {
    e.preventDefault()
    setCollapsed(!collapsed)
  }
  return (
    <main class="flex flex-col h-full">
      <header>
        <nav class="flex bg-well border-b border-divider relative z-10 space-x-2 p-2">
          <h1 class="font-mono text-sm flex items-center flex-1">
            <a href="./">📈 react-stock</a>
          </h1>
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
        <div class="container mx-auto px-6">
          <button
            onClick={onToggle}
            class="flex space-x-1 text-sm text-medium hover:text-label"
          >
            <span>Options</span>
            <Icon name="chevron.down" />
          </button>
        </div>
        {!collapsed && (
          <form class="px-6 py-1 container mx-auto divide-y divide-divider space-y-1">
            <Field label="Symbol" for="symbol">
              <SearchInput />
            </Field>
            <Field label="Resolution" for="resolution">
              <Tabs
                id="resolution"
                tabs={['1m', '5m', '15m', '1h', '1d'].map((name) => ({
                  name,
                }))}
              />
            </Field>
            <Field label="View" for="view-mode">
              <ViewModes />
            </Field>
          </form>
        )}
      </header>
      <section class="container mx-auto px-6 pb-6 space-y-6 flex-1">
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
