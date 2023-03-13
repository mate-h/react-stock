import { chunk, clamp, flatten, max, min } from 'lodash'
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
  xnormv: (x: number) => number
  ymax: number
  ymin: number
  xmin: number
  xmax: number
  lineGroups: CandleDatum[][]
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
  xnorm: (d: CandleDatum) => 0,
  xnormv: (x: number) => 0,
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

  const scale = transform.scale
  const len = data.length
  const chunkWidth = chunkSize / scale
  const px = transform.x / size.width
  const lastCandle = data[data.length - 1]
  const firstCandle = data[0]

  const slice = {
    from: clamp(Math.floor(px * len), 0, len - 1 - chunkWidth),
    to: clamp(Math.floor(px * len + chunkWidth), chunkWidth, len - 1),
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

  target.xmax = firstCandle
    ? firstCandle.date.getTime() + px * getUnit(resolution) * chunkWidth
    : 0
  target.xmin = target.xmax - getUnit(resolution) * chunkWidth

  console.log('target', {
    ymax: target.ymax,
    ymin: target.ymin,
    xmax: new Date(target.xmax),
    xmin: new Date(target.xmin),
  })

  // console.log('target', target)
  let [, invalidate] = useState(0)
  useEffect(() => {
    let cancel
    let frame = () => {
      let d = 0
      let eps = 0.001
      let dy = target.ymax - current.ymax
      let dx = target.ymin - current.ymin
      d += Math.abs(dy) + Math.abs(dx)
      const damp = 1
      current.ymax += dy * damp
      current.ymin += dx * damp
      dy = target.xmax - current.xmax
      dx = target.xmin - current.xmin
      d += Math.abs(dy) + Math.abs(dx)
      current.xmax += dy * damp
      current.xmin += dx * damp
      if (d > eps) {
        invalidate((i) => i + 1)
      }
      current.ynorm = (y: number) => {
        return 1 - norm(y, current.ymin, current.ymax)
      }
      current.xnorm = (d: CandleDatum) => {
        return norm(d.date.getTime(), current.xmin, current.xmax)
      }
      current.xnormv = (x: number) => {
        return norm(x, current.xmin, current.xmax)
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

  const { xmin, xmax, xnorm, xnormv, ymax, ymin, ynorm } = current
  return {
    len,
    data,
    lastCandle,
    firstCandle,
    ynorm,
    xnorm,
    xnormv,
    ymax,
    ymin,
    xmin,
    xmax,
    lineGroups,
  }
}
