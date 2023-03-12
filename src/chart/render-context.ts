import { chunk, flatten, max, min } from 'lodash'
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

  let px = Math.floor((transform.x / size.width) * flatCandles.length)
  px = Math.max(0, px)
  px = Math.min(flatCandles.length - chunkSize, px)
  const candles = flatCandles.slice(px, px + chunkSize)

  console.log('candles', px, px + chunkSize, candles.length)

  const len = candles.length
  const data = candles
  const lastCandle = data[data.length - 1]
  const firstCandle = data[0]
  const yflat = flatten(data.map((d) => [d.open, d.close, d.high, d.low]))
  const ymax = max(yflat) || 0
  const ymin = min(yflat) || 0
  const ynorm = (y: number) => {
    return norm(y, ymin, ymax)
  }
  const selectx = (d: CandleDatum) => d.date.getTime()
  const xmin = min(data.map((d) => d.date.getTime())) || 0
  const xmax = max(data.map((d) => d.date.getTime())) || 0
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
