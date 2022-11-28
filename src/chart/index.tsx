import { atom, useAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import classes from './styles.module.css'
import { Keyed, ChartSource, ChartChild, GetCandles } from './types'
import { get, set } from 'lodash'
import React from 'react'
import { getTradingHours } from './lib'

const sourcesAtom = atom<Keyed<ChartSource>>({})
const useSources = () => useAtom(sourcesAtom)

function error(s: string) {
  console.error(`[react-stock] ${s}`)
}
function warn(s: string) {
  console.warn(`[react-stock] ${s}`)
}
const uid = () => Math.random().toString(36).substring(2, 9)

export type ChartProps = {
  children?: React.ReactNode
}
export const Chart = ({ children }: ChartProps) => {
  const [sources, setSources] = useSources()
  /** Chart id */
  const id = useMemo(() => uid(), [])
  /** Chart source */
  useEffect(() => {
    const source = Object.values(sources).find(({ chartId }) => chartId === id)
    console.log(source, id)
    const l = Object.keys(sources).length
    if (!source) {
      error('current source has not been set using the <Source> component')
      return
    }
    if (l > 1) {
      warn('more than one source has been set, using the first one')
    }

    async function load() {
      const {preMarket, marketOpen, afterHours} = getTradingHours()
      preMarket.open.setDate(preMarket.open.getDate() - 1)
      afterHours.close.setDate(afterHours.close.getDate() - 1)
      const candles = await source!.getCandles({
        symbol: { name: 'BINANCE:BTCUSDT', type: 'crypto' },
        range: [preMarket.open, afterHours.close],
        resolution: '5m',
      })
      console.log(candles.length + ' results')
    }
    load()
  }, [sources])

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const c = child as unknown as React.FunctionComponentElement<ChartChild>
      return React.cloneElement<ChartChild>(c, { chartId: id })
    }
    return child
  })

  return <div class={classes.main}>{childrenWithProps}</div>
}

/**
 * Generic data source provider component
 */
export const Source = (props: { getCandles: GetCandles }) => {
  const [sources, setSources] = useSources()
  const { chartId, getCandles } = props as unknown as ChartSource
  const id = useMemo(() => uid(), [])

  // chart id from parent
  useEffect(() => {
    if (!get(sources, id)) {
      setSources(set(sources, id, props))
    }
  }, [sources])
  return <></>
}
