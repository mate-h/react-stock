import { useState } from 'react'
import { Chart, Source } from './chart'
import { GetCandles } from './chart/types'


// finnhub module
const apiRoot = 'https://finnhub.io/api/v1'
const apiToken = 'c9dhq42ad3id6u3ecv30'

export type FinnhubResponse = {
  c: number[]
  h: number[]
  l: number[]
  o: number[]
  s: string
  t: number[]
  v: number[]
}

const getCandles: GetCandles = async ({ symbol, resolution, range }) => {
  function getUrl() {
    let crypto = false
    let path = crypto ? 'crypto' : 'stock'
    let symbolName = symbol.name

    let from = range[0].getTime()
    let to = range[1].getTime()
    return `${apiRoot}/${path}/candle?symbol=${symbolName}&resolution=${resolution}&from=${from}&to=${to}&token=${apiToken}`
  }

  const candles = (await fetch(getUrl()).then((res) =>
    res.json()
  )) as FinnhubResponse

  return candles.t.map((t, i) => ({
    date: new Date(t * 1000),
    open: candles.o[i],
    high: candles.h[i],
    low: candles.l[i],
    close: candles.c[i],
    volume: candles.v[i],
  }))
}

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
    </main>
  )
}

export default App
