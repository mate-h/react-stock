import { Chart, Source } from './chart'
import { getCandles } from './finnhub'
import { Icon } from './icon'

function App() {
  return (
    <main class="container mx-auto p-6">
      <h1 class="font-mono text-xl">📈 react-stock</h1>
      <p class="my-6">
        Fully modular financial charts made from interactive react SVG
        components styled with tailwind css.
      </p>

      <Chart>
        <Source getCandles={getCandles} />
      </Chart>

      <Icon name="checkmark" />
    </main>
  )
}

export default App
