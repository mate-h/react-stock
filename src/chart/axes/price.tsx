import { useMemo } from 'react'
import { RenderContext } from '../render-context'
import { AxesText } from './text'

type Props = {
  renderContext: RenderContext
  marks: number[]
}
export const PriceAxis = ({ renderContext, marks }: Props) => {
  const { ymin, ymax } = renderContext
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
      <div className="px-1 relative w-18 overflow-hidden border-l border-divider bg-well flex-1">
        {currentMarks.map(({ y, price }, i) => (
          <AxesText key={i} y={y}>
            {price.toFixed(2)}
          </AxesText>
        ))}
      </div>
      <div className="h-6 bg-well" />
    </div>
  )
}
