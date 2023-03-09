import { atom, useAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import {
  CandleResolution,
  GetCandles,
  Subscribe,
  Subscriber,
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

function sendMessage(props: {
  socket: WebSocket
  type: 'subscribe' | 'unsubscribe'
  symbol: string
}) {
  const { socket, type, symbol } = props
  socket.send(JSON.stringify({ type, symbol }))
}

const initSocket = async (callback: (trades: TradeDatum[]) => void) => {
  return new Promise<WebSocket>((resolve, reject) => {
    const endpoint = 'wss://ws.finnhub.io?token=' + apiToken
    const socket = new WebSocket(endpoint)
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data) as SocketMessage
      if (data.type === 'trade') {
        callback(data.data)
      }
    }
    socket.onopen = () => {
      resolve(socket)
    }
  })
}

export const socketAtom = atom<WebSocket | null>(null)

let initialized = false
export const useSocket = (callback: (trades: TradeDatum[]) => void) => {
  const [, setSocket] = useAtom(socketAtom)

  function onUpdate(trades: TradeDatum[]) {
    callback(trades)
  }
  useEffect(() => {
    let s: WebSocket | null = null
    async function init() {
      if (initialized) return
      initialized = true
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
  }, [])
}

export const useFinnhub = () => {
  const listenersRef = useRef<Subscriber[]>([])
  const [socket] = useAtom(socketAtom)
  const socketRef = useRef(socket)
  useEffect(() => {
    socketRef.current = socket
  }, [socket])
  useSocket(onUpdate)
  const subscribe: Subscribe = (props) => {
    listenersRef.current.push(props)

    if (!socketRef.current) return
    sendMessage({
      socket: socketRef.current,
      type: 'subscribe',
      symbol: props.symbol,
    })
  }
  const unsubscribe = (props: { symbol: string }) => {
    listenersRef.current = listenersRef.current.filter(
      (sub) => sub.symbol !== props.symbol
    )
    if (!socketRef.current) return
    sendMessage({
      socket: socketRef.current,
      type: 'unsubscribe',
      symbol: props.symbol,
    })
  }
  useEffect(() => {
    if (!socket) return
    const onOpen = () => {
      listenersRef.current.forEach((props) => {
        sendMessage({
          socket,
          type: 'subscribe',
          symbol: props.symbol,
        })
      })
    }
    if (socket.readyState === WebSocket.OPEN) {
      onOpen()
    }
    socket.addEventListener('open', onOpen)
    return () => {
      socket.removeEventListener('open', onOpen)
    }
  }, [socket])
  function onUpdate(trades: TradeDatum[]) {
    // update min, max, last

    const totalV = trades.reduce((sum, trade) => sum + trade.v, 0)
    const close =
      trades.reduce((sum, trade) => sum + trade.p * trade.v, 0) / totalV
    const date = new Date(trades[trades.length - 1].t)

    listenersRef.current.forEach((sub) => {
      sub.onUpdate({ date, close })
    })
  }

  return { socket, subscribe, unsubscribe }
}
