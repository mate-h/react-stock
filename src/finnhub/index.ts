import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'
import {
  CandleDatum,
  CandleDelta,
  CandleResolution,
  GetCandles,
  Listener,
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
  /** Lise of trade conditions */
  c: number | null
  /** Price */
  p: number
  /** Symbol */
  s: string
  /** Unix ms timestamp */
  t: number
  /** Volume */
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

export const getCandles: GetCandles = async ({ symbol, type, resolution, range }) => {
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

const initSocket = async (callback: (trades: TradeDatum[]) => void) => {
  return new Promise<WebSocket>((resolve, reject) => {
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
        resolve(socket)
        callback(data.data)
      }
    }
  })
}

export const socketAtom = atom<WebSocket | null>(null)

export const listenersAtom = atom<Listener[]>([])

export const useSocket = (onUpdate: (trades: TradeDatum[]) => void) => {
  const [socket, setSocket] = useAtom(socketAtom)
  const [listeners, setListeners] = useAtom(listenersAtom)
  const subscribe: Subscribe = (listener) => {
    setListeners((listeners) => [...listeners, listener])
  }
  useEffect(() => {
    if (listeners.length === 0) return
    let s: WebSocket | null = null
    async function init() {
      s = await initSocket(onUpdate)
      if (s) {
        setSocket(s)
      }
    }
    init()
    return () => {
      if (s) {
        s.close()
      }
    }
  }, [listeners])
  return { socket, listeners, subscribe }
}

export const useFinnhub = () => {
  const { socket, listeners, subscribe } = useSocket(onUpdate)
  function onUpdate(trades: TradeDatum[]) {
    // update min, max, last

    const totalV = trades.reduce((sum, trade) => sum + trade.v, 0)
    const close =
      trades.reduce((sum, trade) => sum + trade.p * trade.v, 0) / totalV
    const date = new Date(trades[trades.length - 1].t)

    listeners.forEach((listener) => listener({ date, close }))
  }

  return { socket, subscribe }
}
