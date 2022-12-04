import { useEffect, useState } from 'react'
import { CandleDatum } from './types'
import { min, max } from 'lodash'
import { classes } from '../classes'
type Props = {
  candles: CandleDatum[]
}

export default ({ candles }: Props) => {
  console.log(candles.length + ' results')

  const [unit, setUnit] = useState(10)

  const len = 40 //candles.length
  const data = candles.filter((e, i) => i < len)

  const norm = (d: CandleDatum, cb: (d: CandleDatum) => number) => {
    const maxVal = max(data.map(cb)) || 0
    const minVal = min(data.map(cb)) || 0
    return (maxVal - cb(d)) / (maxVal - minVal)
  }
  /** percent */
  const p = (x: number) => `${x * 100}%`

  // const h =
  const t = (d?: Date) => (d ? d.getTime() : 0)

  function bars(d: CandleDatum) {
    const x = norm(d, (d) => d.date.getTime())
    const y = norm(d, (d) => d.close)
    const y2 = norm(d, (d) => d.open)
    const y3 = Math.min(y, y2)
    const y4 = Math.max(y, y2)
    const high = norm(d, (d) => d.high)
    const low = norm(d, (d) => d.low)
    const color = d.close > d.open ? 'red' : 'green'
    return (
      <rect
        className={classes(
          color === 'green' && 'fill-green-500',
          color === 'red' && 'fill-red-500'
        )}
        key={d.date.getTime()}
        x={p(x)}
        y={p(y3)}
        width={p(1 / len)}
        height={p(y4 - y3)}
      />
    )
  }
  function line(d: CandleDatum) {
    const x = norm(d, (d) => d.date.getTime())
    const y = norm(d, (d) => d.close)
    const x2 = norm(d, (d) => d.date.getTime())
    const y2 = norm(d, (d) => d.close)
    return <line x1={p(x)} x2={p(x2)} y1={p(y)} y2={p(y2)} />
  }
  return <svg className="w-full h-full">{data.map(bars)}</svg>
}
