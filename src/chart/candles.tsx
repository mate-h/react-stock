import { RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { CandleDatum, CandleDelta } from './types'
import { min, max, chunk, flatten } from 'lodash'
import { classes } from '../classes'
type Props = {
  candles: CandleDatum[]
  delta?: CandleDelta
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

export default ({ candles, delta }: Props) => {
  // console.log(candles.length + ' results')
  // console.log(candles)

  const [unit, setUnit] = useState(10)

  const len = 60
  const data = candles.filter((e, i) => i >= candles.length - len)

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
    const oneMinute = 1000 * 60
    return 1 - norm(selectx(d), xmin, xmax + oneMinute)
  }
  function bar(d: CandleDatum) {
    const pad = 1 / 5 / len
    const x = xnorm(d) + pad / 2
    const y = ynorm(d.close)
    const y2 = ynorm(d.open)
    const y3 = Math.min(y, y2)
    const high = ynorm(d.high)
    const low = ynorm(d.low)
    const color = d.close < d.open ? 'red' : 'green'
    const w = 1 / len - pad
    const h = Math.abs(y - y2)

    // calculate the exact number of pixels for padding and for bar width

    // bar width should be odd number of pixels

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

  const svgRef = useRef<SVGSVGElement>(null)

  let { x, y } = usePointer({ node: svgRef })

  let y2 = 0
  if (delta) {
    y2 = ynorm(delta.close)
  }

  const xSnapped = useMemo(
    () =>
      Math.min(Math.max((Math.round((x - 0.5 / len) * len) + 0.5) / len, 0), 1),
    [x, len]
  )

  const PriceAxis = () => {
    const range = ymax - ymin
    const ycurr = useMemo(() => ymin + range * (1 - y), [y, ymin, ymax])
    const y2curr = useMemo(() => ymin + range * (1 - y2), [y2, ymin, ymax])

    if (svgRef.current) {
      const height = svgRef.current!.getBoundingClientRect().height

      // console.log('height', height)
    }

    const Text = ({ children, y }: { children: any; y: number }) => (
      <p
        class="h-0 flex items-center text-xs"
        style={{
          position: 'absolute',
          top: p(y),
        }}
      >
        {children}
      </p>
    )

    return (
      <div class="flex flex-col">
        <div class="px-1 relative w-18 overflow-hidden border-l border-divider bg-well flex-1">
          <Text y={y}>{ycurr.toFixed(2)}</Text>
          <Text y={y2}>{y2curr.toFixed(2)}</Text>
        </div>
        <div class="h-6 bg-well" />
      </div>
    )
  }

  const TimeAxis = () => {
    const range = xmax - xmin
    const xcurr = useMemo(() => xmin + range * xSnapped, [xSnapped, xmin, xmax])

    function format() {
      if (candles.length === 0) return ''
      const index = Math.round(xSnapped * (candles.length - 1))
      const date = candles[index].date
      const fmt = new Intl.DateTimeFormat('en', {
        hour: 'numeric',
        minute: 'numeric',
      })
      let str = ''
      try {
        str = fmt.format(date)
      } catch (e) {}
      return str
    }
    const Text = ({ children, x }: { children: any; x: number }) => (
      <p
        class="flex items-center justify-center w-0 h-full text-xs h-full whitespace-nowrap"
        style={{
          position: 'absolute',
          left: p(x),
        }}
      >
        {children}
      </p>
    )

    return (
      <div class="px-1 relative w-full h-6 border-t border-divider bg-well">
        <Text x={xSnapped}>{format()}</Text>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative flex">
      <div className="relative flex-1 flex flex-col">
        <svg className="w-full h-full" ref={svgRef}>
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
        </svg>
        <TimeAxis />
      </div>
      <PriceAxis />
    </div>
  )
}
