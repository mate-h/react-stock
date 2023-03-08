import { RefObject, useEffect, useRef, useState } from 'react'
import { ChartAxes } from './axes'
import { CandleChunk } from './chunk'
import { CandleDatum, CandleDelta, CandleResolution } from './types'

type Props = {
  symbol: string
  chunks: CandleDatum[][]
  chunkSize: number
  delta?: CandleDelta
  resolution: CandleResolution
}

function useSizedSvg({ node }: { node: RefObject<SVGSVGElement> }) {
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    if (node.current) {
      const listener = () => {
        const c = node.current!
        const { width, height } = c.getBoundingClientRect()
        setSize({ width, height })
        c.setAttribute('viewBox', `0 0 ${width} ${height}`)
      }
      listener()

      const observer = new ResizeObserver(listener)
      observer.observe(node.current)

      return () => {
        observer.disconnect()
      }
    }
  }, [])
  return size
}

export default ({ symbol, chunks, chunkSize, delta, resolution }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const size = useSizedSvg({ node: svgRef })
  return (
    <ChartAxes
      node={svgRef}
      chunks={chunks}
      delta={delta}
      resolution={resolution}
    >
      <CandleChunk
        symbol={symbol}
        candles={chunks[0]}
        chunkSize={chunkSize}
        delta={delta}
        resolution={resolution}
        size={{ width: size.width, height: size.height }}
      />
    </ChartAxes>
  )
}
