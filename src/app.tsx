import { Chart, Source } from './chart'
import Palette from './chart/palette'
import { getCandles } from './finnhub'
import { Icon } from './icon'
import Menu from './menu/example'

function App() {
  return (
    <main class="container mx-auto p-6 space-y-6">
      <h1 class="font-mono text-xl">📈 react-stock</h1>
      <p>
        Fully modular financial charts made from interactive react SVG
        components styled with tailwind css.
      </p>

      <Chart>
        <Source getCandles={getCandles} />
      </Chart>

      <Menu />

      <section class="space-y-2">
        <p class="font-medium space-x-2 text-primary-400">
          <Icon name="lock" />
          <span>Primary 400</span>
        </p>

        <Palette color="primary" />
        <Palette color="green" />
        <Palette color="red" />
      </section>
    </main>
  )
}

export default App
