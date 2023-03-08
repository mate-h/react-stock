import { useEffect, useMemo, useRef, useState } from 'react'
import { CandleDatum, CandleDelta, CandleResolution } from './types'
import { min, max, chunk, flatten } from 'lodash'
import { classes } from '../classes'
import { useAtom } from 'jotai'
import { transformAtom, viewModeAtom } from './store'
import { usePointer, useTransformedPointer } from '../pointer'
import { getUnit } from './lib'
import { useScroll } from './scroll'

type Props = {
  symbol: string
  chunks: CandleDatum[][]
  chunkSize: number
  delta?: CandleDelta
  resolution: CandleResolution
}

type ChunkProps = {
  symbol: string
  candles: CandleDatum[]
  delta?: CandleDelta
  resolution: CandleResolution
  chunkSize: number
  size: { width: number; height: number }
}

export default ({ symbol, chunks, chunkSize, delta, resolution }: Props) => {
  return (
    <ChartAxes
      symbol={symbol}
      chunks={chunks}
      chunkSize={chunkSize}
      delta={delta}
      resolution={resolution}
    />
  )
}

export const CandleChunk = ({
  symbol,
  candles,
  resolution,
  size,
}: ChunkProps) => {
  const [transform] = useAtom(transformAtom)
  const [viewMode] = useAtom(viewModeAtom)

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
  function formatInterval(from: Date, to: Date) {
    const fmt = Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    })
    const fmt2 = Intl.DateTimeFormat('en', {
      hour: 'numeric',
      minute: 'numeric',
    })
    return `${fmt.format(from)} - ${fmt2.format(to)}`
  }
  function bar(d: CandleDatum, i: number) {
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

    const matches = false
    return (
      <g key={d.date.getTime()}>
        <rect
          className={classes(
            color === 'green' && 'fill-green-500',
            color === 'red' && 'fill-red-500',
            matches && 'stroke-label'
          )}
          x={p(x)}
          y={p(y3)}
          width={p(w)}
          height={p(h)}
          strokeWidth={1 / transform.scale}
        />
        <line
          className={classes(
            color === 'green' && 'stroke-green-500',
            color === 'red' && 'stroke-red-500'
          )}
          x1={p(x + w / 2)}
          y1={p(high)}
          x2={p(x + w / 2)}
          y2={p(low)}
          strokeWidth={1 / transform.scale}
        />
      </g>
    )
  }
  function line([d1, d2]: CandleDatum[]) {
    const u = 1 / len
    const x1 = xnorm(d1)
    const y1 = ynorm(d1.open)
    const x2 = xnorm(d2)
    const y2 = ynorm(d2.open)
    return (
      <line
        className="stroke-medium"
        key={d1.date.getTime()}
        x1={p(x1)}
        y1={p(y1)}
        x2={p(x2)}
        y2={p(y2)}
        strokeWidth={1 / transform.scale}
      />
    )
  }
  function area([d1, d2]: CandleDatum[]) {
    // top of the area is the area between high and low
    // bottom of the area is the area between open and close

    const sx = size.width
    const sy = size.height
    const u = 1 / len
    const x1 = (xnorm(d1) + u / 2) * sx
    const x2 = (xnorm(d2) + u / 2) * sx
    const y1h = ynorm(d1.high) * sy
    const y2h = ynorm(d2.high) * sy
    const y1l = ynorm(d1.low) * sy
    const y2l = ynorm(d2.low) * sy

    const d = `
      M ${x1} ${y1h}
      L ${x2} ${y2h}
      L ${x2} ${y2l}
      L ${x1} ${y1l}
      
    `

    return (
      <g key={d1.date.getTime()}>
        <path className="fill-well" d={d} />
      </g>
    )
  }

  const lineGroups = chunk(
    data.reduce((a, c, i) => {
      a.push(c)
      if (i > 0 && i < data.length - 1) a.push(c)
      return a
    }, [] as CandleDatum[]),
    2
  )

  const stringTransform = useMemo(() => {
    return `translate(${transform.x} ${transform.y}) scale(${transform.scale})`
  }, [transform])

  return (
    <g transform={stringTransform}>
      <rect className="fill-well" x="0" y="0" width="100%" height="100%" />
      {['candles', 'both'].includes(viewMode) && <>{data.map(bar)}</>}

      {['lines', 'both'].includes(viewMode) && (
        <>
          {lineGroups.map(area)}
          {lineGroups.map(line)}
        </>
      )}

      {/* description text node */}
      <text
        x={p(0)}
        y={'1rem'}
        className="text-xs fill-white"
        transform={`scale(${1 / transform.scale})`}
      >
        {symbol}&nbsp;&middot;&nbsp;{resolution}
      </text>
      <text
        x={p(0)}
        y={'2rem'}
        className="text-xs fill-white"
        transform={`scale(${1 / transform.scale})`}
      >
        {formatInterval(new Date(xmin), new Date(xmax))}
      </text>
      {firstCandle && lastCandle && (
        <text
          x={p(0)}
          y={'3rem'}
          className="text-xs fill-white"
          transform={`scale(${1 / transform.scale})`}
        >
          {`$${firstCandle.open.toFixed(2)} - $${lastCandle.close.toFixed(2)}`}
        </text>
      )}
    </g>
  )
}

export const ChartAxes = ({
  symbol,
  chunks,
  chunkSize,
  delta,
  resolution,
}: Props) => {
  const candles = flatten(chunks)
  const len = candles.length
  const data = candles
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .filter((e, i) => i >= candles.length - len)

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

  const svgRef = useRef<SVGSVGElement>(null)
  const transform = useScroll({ node: svgRef })
  const transformRef = useRef(transform)
  useEffect(() => {
    transformRef.current = transform
  }, [transform])
  let { x, y } = useTransformedPointer({ node: svgRef, transformRef })

  let y2
  if (delta) {
    y2 = ynorm(delta.close)
  }

  let xSnapped = useMemo(
    () =>
      Math.min(
        Math.max((Math.round((x - 0.5 / len) * len) + 0.5) / len, 0.5 / len),
        1 - 0.5 / len
      ),
    [x, len]
  )

  xSnapped = x

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
        className="h-0 flex items-center text-xs"
        style={{
          position: 'absolute',
          top: p(y),
          transform: `scaleY(${1 / transform.scale})`,
        }}
      >
        {children}
      </p>
    )

    return (
      <div className="flex flex-col">
        <div
          className="px-1 relative w-18 overflow-hidden border-l border-divider bg-well flex-1"
          style={{
            transformOrigin: 'top left',
            transform: `scaleY(${transform.scale}) translateY(${
              transform.y / transform.scale
            }px) `,
          }}
        >
          <Text y={y}>{ycurr.toFixed(2)}</Text>
          <Text y={y2}>{y2curr.toFixed(2)}</Text>
        </div>
        <div className="h-6 bg-well" />
      </div>
    )
  }

  const TimeAxis = () => {
    function format() {
      if (data.length === 0) return ''
      let index = Math.round(xSnapped * (data.length - 1))
      if (index > data.length - 1) return ''
      if (index < 0) return ''
      const date = data[index].date
      const fmt = new Intl.DateTimeFormat('en', {
        hour: ['1d'].includes(resolution) ? undefined : 'numeric',
        minute: ['1d'].includes(resolution) ? undefined : 'numeric',
        day: ['1m', '5m', '15m'].includes(resolution) ? undefined : 'numeric',
        month: ['1m', '5m', '15m'].includes(resolution) ? undefined : 'short',
        year: ['1d'].includes(resolution) ? 'numeric' : undefined,
      })
      let str = ''
      try {
        str = fmt.format(date)
      } catch (e) {}
      return str
    }
    const Text = ({ children, x }: { children: any; x: number }) => (
      <p
        className="flex items-center justify-center w-0 h-full text-xs h-full whitespace-nowrap"
        style={{
          position: 'absolute',
          left: p(x),
          transform: `scaleX(${1 / transform.scale})`,
        }}
      >
        {children}
      </p>
    )

    return (
      <>
        <div
          className="px-1 relative w-full h-6 border-t border-divider bg-well"
          style={{
            transformOrigin: 'top left',
            transform: `scaleX(${transform.scale}) translateX(${
              transform.x / transform.scale
            }px) `,
          }}
        >
          <Text x={xSnapped}>{format()}</Text>
        </div>
      </>
    )
  }
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    // set the viewbox to the current w and h
    if (svgRef.current) {
      const listener = () => {
        const c = svgRef.current!
        const { width, height } = c.getBoundingClientRect()
        setSize({ width, height })
        c.setAttribute('viewBox', `0 0 ${width} ${height}`)

        // if (width < 600) {
        //   setLen(20)
        // } else if (width < 800) {
        //   setLen(40)
        // } else {
        //   setLen(60)
        // }
      }
      listener()

      const observer = new ResizeObserver(listener)
      observer.observe(svgRef.current)

      return () => {
        observer.disconnect()
      }
    }
  }, [])

  const { x: lx, y: ly } = usePointer({ node: svgRef })

  return (
    <div className="w-full h-full relative flex">
      <div className="relative flex-1 flex flex-col">
        <svg className="w-full h-full" ref={svgRef}>
          <CandleChunk
            symbol={symbol}
            candles={chunks[0]}
            chunkSize={chunkSize}
            delta={delta}
            resolution={resolution}
            size={{ width: size.width, height: size.height }}
          />

          <g>
            <line
              x1={p(lx)}
              y1="0%"
              x2={p(lx)}
              y2="100%"
              className="stroke-medium"
              strokeWidth={1}
              strokeDasharray={4}
            />
            <line
              x1="0"
              y1={p(ly)}
              x2="100%"
              y2={p(ly)}
              className="stroke-medium"
              strokeWidth={1}
              strokeDasharray={4}
            />
          </g>
        </svg>
        <TimeAxis />
      </div>
      <PriceAxis />
    </div>
  )
}
