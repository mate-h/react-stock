import { useMemo } from 'react'
import { useRenderContext } from '../render-context'
import { Transform } from '../scroll'
import { CandleDatum, CandleResolution } from '../types'
import { AxesText } from './text'

type Props = {
  candles: CandleDatum[]
  resolution: CandleResolution
  marks: number[]
  transform: Transform
}
export const PriceAxis = ({ candles, resolution, marks, transform }: Props) => {
  const { ymin, ymax } = useRenderContext({ candles, resolution })
  const range = ymax - ymin
  const currentMarks = useMemo(
    () =>
      marks.map((y) => ({
        y,
        price: ymin + range * (1 - y),
      })),
    [marks, ymin, ymax]
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
        {currentMarks.map(({ y, price }, i) => (
          <AxesText key={i} y={y} scale={transform.scale}>
            {price.toFixed(2)}
          </AxesText>
        ))}
      </div>
      <div className="h-6 bg-well" />
    </div>
  )
}
