import { RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { CandleDatum } from './types'
import { min, max, chunk, flatten } from 'lodash'
import { classes } from '../classes'
type Props = {
  candles: CandleDatum[]
}

const usePointer = ({
  node,
}: {
  node: RefObject<HTMLElement | SVGElement>
}) => {
  // implement pointer events here
  const [state, setState] = useState({ x: 0.5, y: 0.5 })
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      // calculate the relative position to the node
      if (!node.current) return

      const rect = node.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      setState({ x, y })
    }
    window.addEventListener('pointermove', listener)
    return () => window.removeEventListener('pointermove', listener)
  }, [])
  return state
}

export default ({ candles }: Props) => {
  // console.log(candles.length + ' results')
  // console.log(candles)

  const [unit, setUnit] = useState(10)

  const len = candles.length
  const data = candles.filter((e, i) => i < len)

  const norm = (x: number, min: number, max: number) => {
    return (max - x) / (max - min)
  }
  /** percent */
  const p = (x: number) => `${x * 100}%`

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
    const oneMinute = 1000 * 60
    return 1 - norm(selectx(d), xmin, xmax + oneMinute)
  }
  function bar(d: CandleDatum) {
    const x = xnorm(d)
    const y = ynorm(d.close)
    const y2 = ynorm(d.open)
    const y3 = Math.min(y, y2)
    const high = ynorm(d.high)
    const low = ynorm(d.low)
    const color = d.close < d.open ? 'red' : 'green'
    const w = 1 / len
    const h = Math.abs(y - y2)
    return (
      <g key={d.date.getTime()}>
        <rect
          class={classes(
            color === 'green' && 'fill-green-500',
            color === 'red' && 'fill-red-500'
          )}
          x={p(x)}
          y={p(y3)}
          width={p(w)}
          height={p(h)}
        />
        <line
          class={classes(
            color === 'green' && 'stroke-green-500',
            color === 'red' && 'stroke-red-500'
          )}
          x1={p(x + w / 2)}
          y1={p(high)}
          x2={p(x + w / 2)}
          y2={p(low)}
        />
      </g>
    )
  }
  function line([d1, d2]: CandleDatum[]) {
    const x1 = xnorm(d1)
    const y1 = ynorm(d1.open)
    const x2 = xnorm(d2)
    const y2 = ynorm(d2.open)
    return (
      <line
        class="stroke-white"
        key={d1.date.getTime()}
        x1={p(x1)}
        y1={p(y1)}
        x2={p(x2)}
        y2={p(y2)}
      />
    )
  }
  const bars = data.map(bar)
  const lines = chunk(
    data.reduce((a, c, i) => {
      a.push(c)
      if (i > 0 && i < data.length - 1) a.push(c)
      return a
    }, [] as CandleDatum[]),
    2
  ).map(line)

  const svgRef = useRef(null)

  const { x, y } = usePointer({ node: svgRef })

  const l = len - 1
  const xSnapped = useMemo(() => (Math.round(x * l) + 0.5) / l, [x, l])

  const PriceAxis = () => {
    return (
      <g>
        <text x="0%" y="0%" class="fill-label" dominantBaseline="middle">
          0
        </text>
        <text x="0%" y="100%" class="fill-label" dominantBaseline="middle">
          100
        </text>
      </g>
    )
  }

  return (
    <svg className="w-full h-full overflow-visible" ref={svgRef}>
      <defs>
        <filter x="0" y="0" width="1" height="1" id="solid">
          <feFlood flood-color="black" result="bg" />
          <feMerge>
            <feMergeNode in="bg" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {bars}
      {/* {lines} */}
      <line
        x1={p(xSnapped)}
        y1="0%"
        x2={p(xSnapped)}
        y2="100%"
        class="stroke-medium"
        strokeDasharray={4}
      />
      <line
        x1="0"
        y1={p(y)}
        x2="100%"
        y2={p(y)}
        class="stroke-medium"
        strokeDasharray={4}
      />
      <PriceAxis />
    </svg>
  )
}
