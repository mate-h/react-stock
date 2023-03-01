import { useEffect, useRef, useState } from 'react'
import { CandleDelta, CandleResolution } from './types'
import React from 'react'
import { getTradingHours, getUnit } from './lib'
import Candles from './candles'
import { useSource, resolutionAtom, candlesAtom } from './store'
import { useAtom } from 'jotai'

export function CandleData() {
  const source = useSource()
  const [candles, setCandles] = useAtom(candlesAtom)
  const candlesRef = React.useRef(candles)
  const [delta, setDelta] = useState<CandleDelta>()

  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [subscribed, setSubscribed] = useState(false)
  const [resolution] = useAtom(resolutionAtom)
  const resolutionRef = useRef(resolution)

  useEffect(() => {
    if (!source) return
    if (resolutionRef.current !== resolution) {
      resolutionRef.current = resolution
    }

    load({ resolution })
  }, [source, resolution])

  const { preMarket, marketOpen, afterHours } = getTradingHours()

  const [newResolution, setNewResolution] = useState<CandleResolution>('1m')

  async function load({ resolution }: { resolution: CandleResolution }) {
    console.log('loading ' + resolution)
    setLoading(true)
    const now = new Date()
    const unitCount = 60
    const hourAgo = new Date(now.getTime() - unitCount * getUnit(resolution))
    const candles = await source!.getCandles({
      symbol: 'BINANCE:BTCUSDT',
      type: 'crypto',
      range: [hourAgo, now],
      resolution,
    })
    setLoading(false)
    setNewResolution(resolution)
    setCandles(candles)
    candlesRef.current = candles
    return candles
  }

  async function subscribe() {
    console.log('subscribing')
    source!.subscribe((d) => {
      setDelta(d)
      const dc = candlesRef.current
      const lastCandle = dc[dc.length - 1]

      const lastT = lastCandle.date.getTime()
      const currentT = d.date.getTime()

      const resolution = resolutionRef.current

      if (currentT - lastT > getUnit(resolution)) {
        console.log('new candle ', resolution)
        // new candle
        dc.push({
          date: new Date(lastT + getUnit(resolution)),
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

  /** Chart init */
  useEffect(() => {
    if (!source) return

    if (!loaded) {
      load({ resolution })
      setLoaded(true)
    }
    if (!subscribed) {
      subscribe()
      setSubscribed(true)
    }
  }, [source, loaded, subscribed, resolution])

  // if (loading) return null
  return <Candles candles={candles} delta={delta} resolution={newResolution} />
}
