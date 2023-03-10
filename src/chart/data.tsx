import { useEffect, useRef, useState } from 'react'
import { CandleDatum, CandleDelta, CandleResolution } from './types'
import React from 'react'
import { getUnit } from './lib'
import Candles from './candles'
import {
  useSource,
  resolutionAtom,
  candlesAtom,
  symbolSearchAtom,
  defaultMarket,
  candleTypeAtom,
} from './store'
import { useAtom } from 'jotai'

type Market = 'binance'
type Props = {
  market?: Market
  symbol?: string
}

export function CandleData(props: Props) {
  const { market = defaultMarket } = props
  const source = useSource()
  const [chunks, setChunks] = useAtom(candlesAtom)
  const candlesRef = React.useRef(chunks)
  const [delta, setDelta] = useState<CandleDelta>()
  const [search] = useAtom(symbolSearchAtom)
  const [candleType] = useAtom(candleTypeAtom)

  let symbol = `${search}`
  if (candleType === 'crypto') {
    symbol = `${market}:${search}`.toUpperCase()
  }
  let prevSymbolRef = useRef('')

  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [subscribed, setSubscribed] = useState(false)
  const [resolution] = useAtom(resolutionAtom)
  const resolutionRef = useRef(resolution)
  const loadingRef = useRef(loading)

  function onUpdate(d: CandleDelta) {
    setDelta(d)
    const dc = candlesRef.current
    const lastCandle = dc[0][dc[0].length - 1]
    if (!lastCandle) return
    const lastT = lastCandle.date.getTime()
    const currentT = d.date.getTime()
    const res = resolutionRef.current
    if (currentT - lastT > getUnit(res)) {
      if (loadingRef.current) return
      console.log('new candle ', res)
      // new candle
      addNewCandle({
        date: new Date(lastT + getUnit(res)),
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
  }

  useEffect(() => {
    if (!source) return
    if (resolutionRef.current !== resolution) {
      resolutionRef.current = resolution
    }
    let index = 0
    // check the current translation and load more data

    load({ resolution, index })
  }, [source, resolution])

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
      symbol,
      type: candleType,
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
    let el = c
    for (let i = 0; i < dc.length; i++) {
      dc[i].push(el)
      el = dc[i].shift()!
    }
    setChunks(dc)
    candlesRef.current = dc
  }

  async function subscribe() {
    if (source!.subscribe === undefined) return
    console.log('[DEBUG] subscribing', {
      onUpdate,
      symbol,
    })
    prevSymbolRef.current = symbol
    source!.subscribe({
      onUpdate,
      symbol,
    })
  }

  async function unsubscribe() {
    if (source!.unsubscribe === undefined) return
    console.log('[DEBUG] unsubscribing', {
      symbol: prevSymbolRef.current,
    })
    source!.unsubscribe({
      symbol: prevSymbolRef.current,
    })
  }

  /** Chart init */
  useEffect(() => {
    if (!source) return

    if (!loaded) {
      setLoaded(true)
      load({ resolution, index: 0 })
      load({ resolution, index: 1 })
      load({ resolution, index: 2 })
    }
    if (!subscribed) {
      subscribe()
      setSubscribed(true)
    }
  }, [source, loaded, subscribed, resolution])

  /** Refetch on symbol change and unsubscribe and resubscribe */
  useEffect(() => {
    if (!source) return
    if (symbol === undefined) return
    setLoaded(false)
    unsubscribe()
    setChunks([[]])
    candlesRef.current = [[]]

    load({ resolution, index: 0 })
    subscribe()
    setLoaded(true)
  }, [symbol])

  // if (loading) return null
  return (
    <Candles
      symbol={symbol}
      chunks={chunks}
      chunkSize={chunkSize}
      delta={delta}
      resolution={newResolution}
    />
  )
}
