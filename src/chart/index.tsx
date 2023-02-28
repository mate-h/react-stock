import { useEffect, useMemo, useState } from 'react'
import classes from './styles.module.css'
import { GetCandles, CandleDatum, Subscribe } from './types'
import { clone, get, merge, set } from 'lodash'
import React from 'react'
import { getTradingHours } from './lib'
import Candles from './candles'
import { useChart, useSources } from './store'
import { uid } from './util'

function error(s: string) {
  console.error(`[react-stock] ${s}`)
}
function warn(s: string) {
  console.warn(`[react-stock] ${s}`)
}

export type ChartProps = {
  children?: React.ReactNode
}

export function CandleData() {
  const [sources] = useSources()
  const [chart] = useChart()
  const [candles, setCandles] = useState<CandleDatum[]>([])
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

    async function load() {
      const { preMarket, marketOpen, afterHours } = getTradingHours()
      const now = new Date()
      const hourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000)
      const candles = await source!.getCandles({
        symbol: 'BINANCE:BTCUSDT',
        type: 'crypto',
        range: [hourAgo, now],
        resolution: '1m',
      })
      source!.subscribe((datum) => {
        console.log('new candle', datum)
      })
      console.log(candles.length + ' results')
      setCandles(candles)
    }
    load()
  }, [sources, chart])
  return <Candles candles={candles} />
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
