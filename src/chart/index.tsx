import { atom, useAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import classes from './styles.module.css'
import { Keyed, ChartSource, ChartChild, GetCandles } from './types'
import { get, set } from 'lodash'
import React from 'react'

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
  const source = Object.values(sources)[0]
  useEffect(() => {
    const l = Object.keys(sources).length
    if (l === 0) {
      error('current source has not been set using the <Source> component')
    }
    if (l > 1) {
      warn('more than one source has been set, using the first one')
    }
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
export const Source = (props: {
  getCandles: GetCandles
}) => {
  const [sources, setSources] = useSources()
  const { chartId, getCandles } = props as unknown as ChartSource
  const id = useMemo(() => uid(), [])
  
  // chart id from parent
  useEffect(() => {
    if (!get(sources, id)) {
      // setSources(set(sources, id, source))
    }
  }, [sources])
  return <></>
}
