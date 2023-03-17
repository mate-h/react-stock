import { useEffect, useMemo, useRef } from 'react'
import { useTransformedPointer } from '../pointer'
import { PriceAxis } from './axes/price'
import { TimeAxis } from './axes/time'
import { CandleChunk } from './chunk'
import { formatInterval, p } from './lib'
import { ChartLines } from './lines'
import { useNodeSize } from './node-size'
import { useRenderContext } from './render-context'
import { useScroll } from './scroll'
import { CandleDatum, CandleDelta, CandleResolution } from './types'

type Props = {
  symbol: string
  chunks: CandleDatum[][]
  chunkSize: number
  delta?: CandleDelta
  resolution: CandleResolution
}

export default ({ symbol, chunks, chunkSize, delta, resolution }: Props) => {
  const node = useRef<SVGSVGElement>(null)
  const size = useNodeSize({ node })

  const transform = useScroll({
    node,
  })
  const transformRef = useRef(transform)
  useEffect(() => {
    transformRef.current = transform
  }, [transform])
  let { x, y } = useTransformedPointer({ node, transformRef })

  // every other chunk cooridinate is relative to the first chunk
  const renderContext = useRenderContext({
    chunks,
    resolution,
    transform,
    chunkSize,
    size,
  })
  const { firstCandle, lastCandle, xmin, xmax, ymin, ymax, ynorm, xnorm } =
    renderContext

  let y2
  if (delta) {
    y2 = ynorm(delta.close)
  }

  const originX = xmin ? xnorm(xmin) * transform.scale : 0
  const renderText = () => (
    <text
      x={p(originX)}
      y={ymin ? p(ynorm(ymin) * transform.scale) : '0'}
      className="text-xs fill-white"
      transform={`scale(${1 / transform.scale} 1)`}
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
  const DebugRect = () => (
    <rect
      className="stroke-red-500"
      fill="none"
      strokeWidth={1}
      x={xmax ? p(xnorm(xmax)) : '0'}
      y={ymin ? p(ynorm(ymin)) : '0'}
      width={p(xnorm(xmin) - xnorm(xmax))}
      height={p(ynorm(ymax) - ynorm(ymin))}
    />
  )

  return (
    <div className="w-full h-full relative flex">
      <div className="relative flex-1 flex flex-col">
        <svg className="w-full h-full" ref={node}>
          <ChartLines node={node} />
          <CandleChunk
            renderContext={renderContext}
            symbol={symbol}
            chunkSize={chunkSize}
            delta={delta}
            resolution={resolution}
            size={size}
          />

          {renderText()}
          <DebugRect />
        </svg>
        <TimeAxis
          renderContext={renderContext}
          resolution={resolution}
          transform={transform}
          marks={[x]}
        />
      </div>
      <PriceAxis
        renderContext={renderContext}
        transform={transform}
        marks={[y, y2]}
      />
    </div>
  )
}
