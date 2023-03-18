import { chunk, clamp, flatten, max, min } from 'lodash'
import { useEffect, useState } from 'react'
import { getUnit, norm } from './lib'
import { Transform } from './scroll'
import { CandleDatum, CandleResolution } from './types'

export type RenderContext = {
  chunkWidth: number
  data: CandleDatum[]
  lastCandle: CandleDatum
  firstCandle: CandleDatum
  ynorm: (y: number) => number
  xnorm: (x: number) => number
  ymax: number
  ymin: number
  xmin: number
  xmax: number
  lineGroups: CandleDatum[][]
  chunks: CandleDatum[][]
  chunkSize: number
  resolution: CandleResolution
  transform: Transform
  size: { width: number; height: number }
}

let target = {
  ymax: 0,
  ymin: 0,
  xmax: 0,
  xmin: 0,
}
let current = {
  ymax: 0,
  ymin: 0,
  xmax: 0,
  xmin: 0,
  ynorm: (y: number) => 0,
  xnorm: (x: number) => 0,
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
  const data = flatten(chunks)
    .filter((x) => x)
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  // index 0 is the most recent candle (maximum x)

  const scale = transform.scale
  const chunkWidth = chunkSize / scale
  const px = transform.x / size.width
  const maxIndex = data.length - 1
  const lastCandle = data[maxIndex]
  const timeUnit = getUnit(resolution)
  const firstCandle = data[0]

  const timeWidth = timeUnit * chunkWidth

  target.xmax = firstCandle
    ? firstCandle.date.getTime() + timeUnit - px * timeWidth
    : 0
  target.xmin = target.xmax - timeWidth

  const findIndex = (x: number) => data.findIndex((d) => d.date.getTime() < x)

  const slice = {
    to: clamp(findIndex(target.xmin), chunkWidth, maxIndex),
    from: clamp(findIndex(target.xmax) + 1, 0, maxIndex - chunkWidth),
  }
  const yflat = flatten(
    data
      .slice(slice.from, slice.to)
      .map((d) => [d.open, d.close, d.high, d.low])
  )
  const tymax = max(yflat) || 0
  const tymin = min(yflat) || 0
  target.ymax = tymax
  target.ymin = tymin

  let [, invalidate] = useState(0)
  useEffect(() => {
    let cancel
    let frame = () => {
      let d = 0
      let eps = 0.001
      let dy = target.ymax - current.ymax
      let dx = target.ymin - current.ymin
      d += Math.abs(dy) + Math.abs(dx)
      const dampX = .1
      const dampY = 0.1
      current.ymax += dy * dampY
      current.ymin += dx * dampY
      dy = target.xmax - current.xmax
      dx = target.xmin - current.xmin
      d += Math.abs(dy) + Math.abs(dx)
      current.xmax += dy * dampX
      current.xmin += dx * dampX
      if (d > eps) {
        invalidate((i) => i + 1)
      }
      current.ynorm = (y: number) => {
        return norm(y, current.ymin, current.ymax)
      }
      current.xnorm = (x: number) => {
        return 1 - norm(x, current.xmin, current.xmax)
      }
      cancel = requestAnimationFrame(frame)
    }
    cancel = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(cancel)
  }, [])

  const lineGroups = chunk(
    data.reduce((a, c, i) => {
      a.push(c)
      if (i > 0 && i < data.length - 1) a.push(c)
      return a
    }, [] as CandleDatum[]),
    2
  )

  const { xmin, xmax, xnorm, ymax, ymin, ynorm } = current
  return {
    chunkWidth,
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
    chunks,
    chunkSize,
    resolution,
    transform,
    size,
  }
}
