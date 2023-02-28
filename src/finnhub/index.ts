import { atom, useAtom } from 'jotai'
import { CandleResolution, GetCandles, Subscribe } from '../chart/types'
// import mockData from './mock.json'

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

export function getResolution(resolution: CandleResolution): string {
  const lookup: Partial<Record<CandleResolution, string>> = {
    '1m': '1',
    '5m': '5',
    '15m': '15',
    '30m': '30',
    '1h': '60',
    '1d': 'D',
    '1w': 'W',
    '1M': 'M',
  }
  return lookup[resolution] || '1'
}

export const getCandles: GetCandles = async ({
  symbol,
  type,
  resolution,
  range,
}) => {
  function getUrl() {
    let symbolName = symbol
    const msec = (sec: number) => Math.floor(sec / 1000)
    let from = msec(range[0].getTime())
    let to = msec(range[1].getTime())
    let res = getResolution(resolution)
    return `${apiRoot}/${type}/candle?symbol=${symbolName}&resolution=${res}&from=${from}&to=${to}&token=${apiToken}`
  }
  async function getCandles(mock = false) {
    // if (mock) return mockData
    return (await fetch(getUrl()).then((res) => res.json())) as FinnhubResponse
  }
  const candles = await getCandles(false)

  if (candles.s !== 'ok') {
    return []
  }

  return candles.t.map((t, i) => ({
    date: new Date(t * 1000),
    open: candles.o[i],
    high: candles.h[i],
    low: candles.l[i],
    close: candles.c[i],
    volume: candles.v[i],
  }))
}

export const listeners: ((p: number) => void)[] = []

export const subscribe: Subscribe = (listener) => {
  listeners.push(listener)
}

export const initSocket = () => {
  const endpoint = 'wss://ws.finnhub.io?token=' + apiToken
  const socket = new WebSocket(endpoint)
  socket.onopen = () => {
    socket.send(
      JSON.stringify({ type: 'subscribe', symbol: 'BINANCE:BTCUSDT' })
    )
  }
  socket.onmessage = (event) => {
    type Datum = {
      c: number | null
      p: number
      s: string
      t: number
      v: number
    }
    const data = JSON.parse(event.data) as {
      type: string
      data: Datum[]
    }
    if (data.type === 'trade') {
      // console.log(data)
      const latestPrice = data.data.sort((a, b) => b.t - a.t)[0].p
      listeners.forEach((listener) => listener(latestPrice))
    }
  }
  return socket
}

export const socketAtom = atom(initSocket())

export const useSocket = () => {
  const [socket] = useAtom(socketAtom)
  return socket
}
