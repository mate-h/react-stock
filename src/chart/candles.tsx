import { RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { CandleDatum, CandleDelta, CandleResolution } from './types'
import { min, max, chunk, flatten } from 'lodash'
import { classes } from '../classes'
import { useAtom } from 'jotai'
import { viewModeAtom } from './store'
import { usePointer } from '../pointer'
import { getUnit } from './lib'
import { useScroll } from '../scroll'

type Props = {
  candles: CandleDatum[]
  delta?: CandleDelta
  resolution: CandleResolution
}

export default ({ candles, delta, resolution }: Props) => {
  // console.log(data.length + ' results')
  // console.log(candles)

  const [unit, setUnit] = useState(10)

  const [len, setLen] = useState(60)
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
  const selectx = (d: CandleDatum) => d.date.getTime()
  const xmin = min(data.map((d) => d.date.getTime())) || 0
  const xmax = max(data.map((d) => d.date.getTime())) || 0
  const xnorm = (d: CandleDatum) => {
    const oneMinute = getUnit(resolution)
    return 1 - norm(selectx(d), xmin, xmax + oneMinute)
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

    const index = Math.round(xSnapped * (data.length - 1))
    const matches = index === i
    return (
      <g key={d.date.getTime()}>
        <rect
          class={classes(
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
          class={classes(
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
        class="stroke-medium"
        key={d1.date.getTime()}
        x1={p(x1)}
        y1={p(y1)}
        x2={p(x2)}
        y2={p(y2)}
        strokeWidth={1 / transform.scale}
      />
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

  const svgRef = useRef<SVGSVGElement>(null)
  const transform = useScroll({ node: svgRef })
  const transformRef = useRef(transform)
  useEffect(() => {
    transformRef.current = transform
  }, [transform])
  let { x, y } = usePointer({ node: svgRef, transformRef })

  const stringTransform = useMemo(() => {
    return `translate(${transform.x} ${transform.y}) scale(${transform.scale})`
  }, [transform])
  let y2 = 0
  if (delta) {
    y2 = ynorm(delta.close)
  }

  const xSnapped = useMemo(
    () =>
      Math.min(
        Math.max((Math.round((x - 0.5 / len) * len) + 0.5) / len, 0.5 / len),
        1 - 0.5 / len
      ),
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
          transform: `scaleY(${1 / transform.scale})`,
        }}
      >
        {children}
      </p>
    )

    return (
      <div class="flex flex-col">
        <div
          class="px-1 relative w-18 overflow-hidden border-l border-divider bg-well flex-1"
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
        <div class="h-6 bg-well" />
      </div>
    )
  }

  const TimeAxis = () => {
    const range = xmax - xmin
    const xcurr = useMemo(() => xmin + range * xSnapped, [xSnapped, xmin, xmax])

    function format() {
      if (data.length === 0) return ''
      const index = Math.round(xSnapped * (data.length - 1))
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
        class="flex items-center justify-center w-0 h-full text-xs h-full whitespace-nowrap"
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
          class="px-1 relative w-full h-6 border-t border-divider bg-well"
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
        <path class="fill-well" d={d} />
      </g>
    )
  }

  useEffect(() => {
    // set the viewbox to the current w and h
    if (svgRef.current) {
      const listener = () => {
        const c = svgRef.current!
        const { width, height } = c.getBoundingClientRect()
        setSize({ width, height })
        c.setAttribute('viewBox', `0 0 ${width} ${height}`)

        if (width < 600) {
          setLen(20)
        } else if (width < 800) {
          setLen(40)
        } else {
          setLen(60)
        }
      }
      listener()

      const observer = new ResizeObserver(listener)
      observer.observe(svgRef.current)

      return () => {
        observer.disconnect()
      }
    }
  }, [])

  const [viewMode] = useAtom(viewModeAtom)

  return (
    <div class="w-full h-full relative flex">
      <div class="relative flex-1 flex flex-col">
        <svg class="w-full h-full" ref={svgRef}>
          <g transform={stringTransform}>
            <rect class="fill-well" x="0" y="0" width="100%" height="100%" />
            {['candles', 'both'].includes(viewMode) && <>{data.map(bar)}</>}

            {['lines', 'both'].includes(viewMode) && (
              <>
                {lineGroups.map(area)}
                {lineGroups.map(line)}
              </>
            )}

            <line
              x1={p(xSnapped)}
              y1="0%"
              x2={p(xSnapped)}
              y2="100%"
              class="stroke-medium"
              strokeWidth={1 / transform.scale}
              strokeDasharray={4 / transform.scale}
            />
            <line
              x1="0"
              y1={p(y2)}
              x2="100%"
              y2={p(y2)}
              class="stroke-medium"
              strokeWidth={1 / transform.scale}
              strokeDasharray={4 / transform.scale}
            />
          </g>
        </svg>
        <TimeAxis />
      </div>
      <PriceAxis />
    </div>
  )
}
