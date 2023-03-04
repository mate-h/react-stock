import { Chart, Source } from './chart'
import { CandleData } from './chart/data'
import { getCandles, useFinnhub } from './finnhub'
import Header from './header'

function App() {
  const { subscribe } = useFinnhub()
  return (
    <main className="flex flex-col h-full">
      <Header />
      <section className="container mx-auto px-6 pb-6 space-y-6 flex-1">
        <div className="relative h-full">
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
