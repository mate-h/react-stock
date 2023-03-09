import { chunk, flatten, max, min } from 'lodash'
import { getUnit } from './lib'
import { CandleDatum, CandleResolution } from './types'

/**
 * Get render context for chart
 * @param candles candle data
 * @param resolution candle resolution
 * @returns useful functions for rendering the chart
 */
export function useRenderContext(
  candles: CandleDatum[],
  resolution: CandleResolution
) {
  const len = candles.length
  const data = candles.sort((a, b) => a.date.getTime() - b.date.getTime())
  const lastCandle = data[data.length - 1]
  const firstCandle = data[0]

  const norm = (x: number, min: number, max: number) => {
    return (max - x) / (max - min)
  }
  /** percent */
  const p = (x: number) => (isNaN(x) ? '0%' : `${x * 100}%`)

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
    p,
    lineGroups,
  }
}
