import { chunk, flatten, max, min } from 'lodash'
import { useEffect, useState } from 'react'
import { getUnit, norm } from './lib'
import { Transform } from './scroll'
import { CandleDatum, CandleResolution } from './types'

export type RenderContext = {
  len: number
  data: CandleDatum[]
  lastCandle: CandleDatum
  firstCandle: CandleDatum
  ynorm: (y: number) => number
  xnorm: (d: CandleDatum) => number
  ymax: number
  ymin: number
  xmin: number
  xmax: number
  lineGroups: CandleDatum[][]
}

let target = {
  max: 0,
  min: 0,
}
let current = {
  ymax: 0,
  ymin: 0,
  ynorm: (y: number) => 0,
}

/**
 * Get render context for chart
 * @param candles candle data
 * @param resolution candle resolution
 * @returns useful functions for rendering the chart
 */
export function useRenderContext({
  chunks,
  resolution,
  transform,
  chunkSize,
  size,
}: {
  chunks: CandleDatum[][]
  chunkSize: number
  resolution: CandleResolution
  transform: Transform
  size: { width: number; height: number }
}): RenderContext {
  const flatCandles = flatten(chunks)
    .filter((x) => x)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
  // chunkSize is 60
  // size.width is the width of the chart in pixels
  // transform.x is the translation of the chart in pixels
  // scale is the zoom level of the chart
  const scale = transform.scale
  const total = flatCandles.length
  const chunkWidth = chunkSize / scale
  let px = (transform.x / size.width) * total
  px = Math.max(0, px)
  px = Math.min(total - chunkWidth, px)
  const candles = flatCandles.slice(px, px + chunkWidth).reverse()

  const len = candles.length
  const data = candles
  const lastCandle = data[data.length - 1]
  const firstCandle = data[0]
  const yflat = flatten(data.map((d) => [d.open, d.close, d.high, d.low]))

  const tymax = max(yflat) || 0
  const tymin = min(yflat) || 0
  const tynorm = (y: number) => {
    return norm(y, tymin, tymax)
  }
  target.max = tymax
  target.min = tymin

  // console.log('target', target)
  let [, invalidate] = useState(0)
  useEffect(() => {
    let cancel
    let frame = () => {
      const dy = target.max - current.ymax
      const dx = target.min - current.ymin
      current.ymax += dy * 0.1
      current.ymin += dx * 0.1
      if (Math.abs(dy) > 0.001 && Math.abs(dx) > 0.001) {
        invalidate((i) => i + 1)
      }
      current.ynorm = (y: number) => {
        return norm(y, current.ymin, current.ymax)
      }
      cancel = requestAnimationFrame(frame)
    }
    cancel = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(cancel)
  }, [])

  const selectx = (d: CandleDatum) => d.date.getTime()
  const xmin = min(candles.map((d) => d.date.getTime())) || 0
  const xmax = max(candles.map((d) => d.date.getTime())) || 0
  const xnorm = (d: CandleDatum) => {
    const timeUnit = getUnit(resolution)
    return 1 - norm(selectx(d), xmin, xmax + timeUnit)
  }
  const lineGroups = chunk(
    data.reduce((a, c, i) => {
      a.push(c)
      if (i > 0 && i < data.length - 1) a.push(c)
      return a
    }, [] as CandleDatum[]),
    2
  )

  const { ymax, ymin, ynorm } = current
  return {
    len,
    data,
    lastCandle,
    firstCandle,
    ynorm,
    xnorm,
    ymax,
    ymin,
    xmin,
    xmax,
    lineGroups,
  }
}
