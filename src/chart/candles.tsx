import { flatten } from 'lodash'
import { RefObject, useEffect, useRef, useState } from 'react'
import { useTransformedPointer } from '../pointer'
import { PriceAxis } from './axes/price'
import { TimeAxis } from './axes/time'
import { CandleChunk } from './chunk'
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

  const refCandles = chunks[0]
  const flatCandles = flatten(chunks)
  const { ynorm } = useRenderContext({ candles: refCandles, resolution })

  const transform = useScroll({ node })
  const transformRef = useRef(transform)
  useEffect(() => {
    transformRef.current = transform
  }, [transform])
  let { x, y } = useTransformedPointer({ node, transformRef })

  let y2
  if (delta) {
    y2 = ynorm(delta.close)
  }

  // every other chunk cooridinate is relative to the first chunk
  const refContext = useRenderContext({ candles: refCandles, resolution })

  return (
    <div className="w-full h-full relative flex">
      <div className="relative flex-1 flex flex-col">
        <svg className="w-full h-full" ref={node}>
          <ChartLines node={node} />
          {chunks.map((candles, i) => (
            <CandleChunk
              key={i}
              refContext={refContext}
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
          candles={refCandles}
          resolution={resolution}
          transform={transform}
          marks={[x]}
        />
      </div>
      <PriceAxis
        candles={refCandles}
        resolution={resolution}
        transform={transform}
        marks={[y, y2]}
      />
    </div>
  )
}
