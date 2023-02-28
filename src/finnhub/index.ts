import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'
import {
  CandleDatum,
  CandleResolution,
  GetCandles,
  Subscribe,
} from '../chart/types'
// import mockData from './mock.json'

// finnhub module
const apiRoot = 'https://finnhub.io/api/v1'
const apiToken = 'c9dhq42ad3id6u3ecv30'

export type CandlesResponse = {
  c: number[]
  h: number[]
  l: number[]
  o: number[]
  s: string
  t: number[]
  v: number[]
}

interface SocketMessageBase<Datum, Type = string> {
  type: Type
  data: Datum[]
}

type TradeDatum = {
  c: number | null
  p: number
  s: string
  t: number
  v: number
}

interface SocketTrade extends SocketMessageBase<TradeDatum, 'trade'> {}

type SocketMessage = SocketTrade

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

const getCandles: GetCandles = async ({ symbol, type, resolution, range }) => {
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
    return (await fetch(getUrl()).then((res) => res.json())) as CandlesResponse
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

const initSocket = (callback: (trades: TradeDatum[]) => void) => {
  const endpoint = 'wss://ws.finnhub.io?token=' + apiToken
  const socket = new WebSocket(endpoint)
  socket.onopen = () => {
    socket.send(
      JSON.stringify({ type: 'subscribe', symbol: 'BINANCE:BTCUSDT' })
    )
  }
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data) as SocketMessage
    if (data.type === 'trade') {
      callback(data.data)
    }
  }
  return socket
}

export const socketAtom = atom<WebSocket | null>(null)
export const listenersAtom = atom<((d: CandleDatum) => void)[]>([])

export const useFinnhub = () => {
  const [socket, setSocket] = useAtom(socketAtom)
  function onUpdate(trades: TradeDatum[]) {
    console.log(trades.length)
  }
  useEffect(() => {
    if (!socket) {
      const s = initSocket(onUpdate)
      setSocket(s)
    } else {
      return () => socket.close()
    }
  }, [socket, setSocket])
  const [, setListeners] = useAtom(listenersAtom)
  const subscribe: Subscribe = (listener) => {
    setListeners((listeners) => [...listeners, listener])
  }
  return { socket, getCandles, subscribe }
}
