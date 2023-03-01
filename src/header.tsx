import { atom, useAtom } from 'jotai'
import Tabs from './tabs'
import Input from './input'
import { Icon } from './icon'
import { Field } from './field'
import { useState } from 'react'

export const viewModeAtom = atom('candles')
export const symbolSearchAtom = atom('BTCUSDT')
const ViewModes = () => {
  const [, setViewMode] = useAtom(viewModeAtom)
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

export default () => {
  const [collapsed, setCollapsed] = useState(true)
  function onToggle(e: React.MouseEvent) {
    e.preventDefault()
    setCollapsed(!collapsed)
  }
  return (
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
  )
}