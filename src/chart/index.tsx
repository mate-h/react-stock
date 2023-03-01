import { useEffect, useMemo, useState } from 'react'
import classes from './styles.module.css'
import { GetCandles, CandleDatum, Subscribe, CandleDelta } from './types'
import { clone, get, merge, set } from 'lodash'
import React from 'react'
import { getTradingHours } from './lib'
import Candles from './candles'
import { useChart, useSources } from './store'
import { uid } from './util'
import { atom, useAtom } from 'jotai'

function error(s: string) {
  console.error(`[react-stock] ${s}`)
}
function warn(s: string) {
  console.warn(`[react-stock] ${s}`)
}

export type ChartProps = {
  children?: React.ReactNode
}

const candlesAtom = atom<CandleDatum[]>([])

export function CandleData() {
  const [sources] = useSources()
  const [chart] = useChart()
  const [candles, setCandles] = useAtom(candlesAtom)
  const candlesRef = React.useRef(candles)
  const [delta, setDelta] = useState<CandleDelta>()

  const [loaded, setLoaded] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  /** Chart source */
  useEffect(() => {
    const source = Object.values(sources).find((s) => s.chartId === chart.id)
    const l = Object.keys(sources).length
    if (!source) {
      error('current source has not been set using the <Source> component')
      return
    }
    if (l > 1) {
      warn('more than one source has been set, using the first one')
    }

    const { preMarket, marketOpen, afterHours } = getTradingHours()

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
        resolution: '1m',
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
  }, [sources, candles, loaded, subscribed])
  return <Candles candles={candles} delta={delta} />
}

export const Chart = ({ children }: ChartProps) => {
  return <div class={classes.main}>{children}</div>
}

/**
 * Generic data source provider component
 */
export const Source = (props: {
  getCandles: GetCandles
  subscribe: Subscribe
}) => {
  const [chart] = useChart()
  const [sources, setSources] = useSources()
  const id = useMemo(() => uid(), [])

  // chart id from parent
  useEffect(() => {
    if (!get(sources, id)) {
      setSources(
        set(sources, id, merge(clone(props), { id, chartId: chart.id }))
      )
    }
  }, [sources])
  return <></>
}
