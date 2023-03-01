import { useEffect, useState } from 'react'
import { CandleDatum, CandleDelta } from './types'
import React from 'react'
import { getTradingHours } from './lib'
import Candles from './candles'
import { useSource, resolutionAtom, candlesAtom } from './store'
import { useAtom } from 'jotai'

export function CandleData() {
  const source = useSource()
  const [candles, setCandles] = useAtom(candlesAtom)
  const candlesRef = React.useRef(candles)
  const [delta, setDelta] = useState<CandleDelta>()

  const [loaded, setLoaded] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [resolution] = useAtom(resolutionAtom)

  /** Chart source */
  useEffect(() => {
    const { preMarket, marketOpen, afterHours } = getTradingHours()

    if (!source) return

    async function subscribe() {
      source!.subscribe((d) => {
        setDelta(d)
        const dc = candlesRef.current
        const lastCandle = dc[dc.length - 1]

        const lastT = lastCandle.date.getTime()
        const currentT = d.date.getTime()

        if (currentT - lastT > 1000 * 60) {
          // new candle
          dc.push({
            date: d.date,
            open: d.close,
            close: d.close,
            high: d.close,
            low: d.close,
            volume: 0,
          })
        } else {
          // update last candle
          lastCandle.close = d.close
          lastCandle.high = Math.max(lastCandle.high, d.close)
          lastCandle.low = Math.min(lastCandle.low, d.close)
        }
        candlesRef.current = dc
        setCandles(dc)
      })
    }

    async function load() {
      const now = new Date()
      const hourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000)
      const candles = await source!.getCandles({
        symbol: 'BINANCE:BTCUSDT',
        type: 'crypto',
        range: [hourAgo, now],
        resolution,
      })
      candlesRef.current = candles
      setCandles(candles)
    }
    if (!loaded) {
      load()
      setLoaded(true)
    }
    if (!subscribed) {
      subscribe()
      setSubscribed(true)
    }
  }, [source, candles, loaded, subscribed, resolution])
  return <Candles candles={candles} delta={delta} />
}
