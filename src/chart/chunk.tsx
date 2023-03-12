import { useAtom } from 'jotai'
import { useMemo } from 'react'
import { classes } from '../classes'
import { formatInterval, p } from './lib'
import { RenderContext } from './render-context'
import { transformAtom, viewModeAtom } from './store'
import { CandleDatum, CandleDelta, CandleResolution } from './types'

type ChunkProps = {
  symbol: string
  candles: CandleDatum[]
  delta?: CandleDelta
  resolution: CandleResolution
  renderContext: RenderContext
  chunkSize: number
  size: { width: number; height: number }
}

export const CandleChunk = ({
  candles,
  symbol,
  resolution,
  renderContext,
  size,
}: ChunkProps) => {
  const [transform] = useAtom(transformAtom)
  const [viewMode] = useAtom(viewModeAtom)

  const {
    len,
    xnorm,
    ynorm,
    firstCandle,
    lastCandle,
    xmin,
    xmax,
    ymax,
    ymin,
    lineGroups,
  } = renderContext

  // const {
  //   ymin,
  //   ymax,
  //   ynorm
  // } = useSmoothAxis({})

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
  /**
   * top of the area is the area between high and low
   * bottom of the area is the area between open and close
   */
  function area([d1, d2]: CandleDatum[]) {
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

  const stringTransform = useMemo(() => {
    return `translate(${transform.x} ${transform.y}) scale(${transform.scale})`
  }, [transform])

  const originX = firstCandle ? xnorm(firstCandle) * transform.scale : 0
  const renderText = () => (
    <text
      x={p(originX)}
      y={ymax ? p(ynorm(ymax) * transform.scale) : '0'}
      className="text-xs fill-white"
      transform={`scale(${1 / transform.scale})`}
    >
      <tspan x={p(originX)} dy="1.2em">
        {symbol}&nbsp;&middot;&nbsp;{resolution}
      </tspan>
      <tspan x={p(originX)} dy="1.2em">
        {formatInterval(new Date(xmin), new Date(xmax))}
      </tspan>
      {firstCandle && lastCandle && (
        <tspan x={p(originX)} dy="1.2em">
          {`$${firstCandle.open.toFixed(2)} - $${lastCandle.close.toFixed(2)}`}
        </tspan>
      )}
    </text>
  )

  return (
    <g transform={stringTransform}>
      <rect
        className="fill-well"
        x={firstCandle ? p(xnorm(firstCandle)) : '0'}
        y={ymax ? p(ynorm(ymax)) : '0'}
        width="100%"
        height={p(ynorm(ymin) - ynorm(ymax))}
      />
      {['candles', 'both'].includes(viewMode) && <>{candles.map(bar)}</>}

      {['lines', 'both'].includes(viewMode) && (
        <>
          {lineGroups.map(area)}
          {lineGroups.map(line)}
        </>
      )}

      {/* description text node */}
      {/* {renderText()} */}
    </g>
  )
}
