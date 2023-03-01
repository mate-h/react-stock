import { useEffect, useMemo } from 'react'
import classes from './styles.module.css'
import { GetCandles, Subscribe } from './types'
import { clone, get, merge, set } from 'lodash'
import React from 'react'
import { useChart, useSources } from './store'
import { uid } from './util'

export type ChartProps = {
  children?: React.ReactNode
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
