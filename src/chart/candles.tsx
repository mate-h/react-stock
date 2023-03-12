import { flatten, max, min, set } from 'lodash'
import { useEffect, useRef } from 'react'
import { useTransformedPointer } from '../pointer'
import { PriceAxis } from './axes/price'
import { TimeAxis } from './axes/time'
import { CandleChunk } from './chunk'
import { norm } from './lib'
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
    adapter: (t) => {
      t.y = 0
      return t
    },
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

  const flatCandles = flatten(chunks)

  let y2
  if (delta) {
    y2 = renderContext.ynorm(delta.close)
  }

  return (
    <div className="w-full h-full relative flex">
      <div className="relative flex-1 flex flex-col">
        <svg className="w-full h-full" ref={node}>
          <ChartLines node={node} />
          {chunks.map((candles, i) => (
            <CandleChunk
              key={i}
              renderContext={renderContext}
              symbol={symbol}
              candles={candles}
              chunkSize={chunkSize}
              delta={delta}
              resolution={resolution}
              size={{ width: size.width, height: size.height }}
            />
          ))}
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
