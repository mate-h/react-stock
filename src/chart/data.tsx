import { useEffect, useRef, useState } from 'react'
import { CandleDatum, CandleDelta, CandleResolution } from './types'
import React from 'react'
import { getTradingHours, getUnit } from './lib'
import Candles from './candles'
import { useSource, resolutionAtom, candlesAtom } from './store'
import { useAtom } from 'jotai'

export function CandleData() {
  const source = useSource()
  const [chunks, setChunks] = useAtom(candlesAtom)
  const candlesRef = React.useRef(chunks)
  const [delta, setDelta] = useState<CandleDelta>()

  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [subscribed, setSubscribed] = useState(false)
  const [resolution] = useAtom(resolutionAtom)
  const resolutionRef = useRef(resolution)
  const loadingRef = useRef(loading)

  useEffect(() => {
    if (!source) return
    if (resolutionRef.current !== resolution) {
      resolutionRef.current = resolution
    }
    let index = 0
    // check the current translation and load more data

    load({ resolution, index })
  }, [source, resolution])

  const { preMarket, marketOpen, afterHours } = getTradingHours()

  const [newResolution, setNewResolution] = useState<CandleResolution>('1m')

  useEffect(() => {
    console.log('chunk 0 size', chunks[0].length)
    console.log('chunk count', chunks.length)
  }, [chunks])

  const chunkSize = 60
  async function load({
    resolution,
    index,
  }: {
    resolution: CandleResolution
    index: number
  }) {
    console.log('loading ' + resolution)
    setLoading(true)
    loadingRef.current = true

    const chunkOffset = chunkSize * index
    const timeUnit = getUnit(resolution)
    const now = new Date()
    const chunkStart = new Date(now.getTime() - chunkOffset * timeUnit)
    const chunkEnd = new Date(chunkStart.getTime() - chunkSize * timeUnit)

    const chunk = await source!.getCandles({
      symbol: 'BINANCE:BTCUSDT',
      type: 'crypto',
      range: [chunkEnd, chunkStart],
      resolution,
    })
    setLoading(false)
    loadingRef.current = false
    setNewResolution(resolution)
    const dc = candlesRef.current
    dc[index] = chunk
    setChunks(dc)
    candlesRef.current = dc
    return dc
  }
  function addNewCandle(c: CandleDatum) {
    const dc = candlesRef.current
    // push into the data array and shift according to chunk size
    dc[0].push(c)
    dc[0].shift()
    setChunks(dc)
    candlesRef.current = dc
  }

  async function subscribe() {
    if (source!.subscribe === undefined) return
    console.log('subscribing')
    source!.subscribe((d) => {
      setDelta(d)
      const dc = candlesRef.current
      const lastCandle = dc[0][dc[0].length - 1]
      const lastT = lastCandle.date.getTime()
      const currentT = d.date.getTime()

      const resolution = resolutionRef.current

      if (currentT - lastT > getUnit(resolution)) {
        if (loadingRef.current) return
        console.log('new candle ', resolution)
        // new candle
        addNewCandle({
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
        candlesRef.current = dc
        setChunks(dc)
      }
    })
  }

  /** Chart init */
  useEffect(() => {
    if (!source) return

    if (!loaded) {
      setLoaded(true)
      load({ resolution, index: 0 })
    }
    if (!subscribed) {
      subscribe()
      setSubscribed(true)
    }
  }, [source, loaded, subscribed, resolution])

  // if (loading) return null
  return (
    <Candles
      chunks={chunks}
      chunkSize={chunkSize}
      delta={delta}
      resolution={newResolution}
    />
  )
}
