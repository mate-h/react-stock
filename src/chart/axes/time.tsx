import { useMemo } from 'react'
import { RenderContext, useRenderContext } from '../render-context'
import { Transform } from '../scroll'
import { CandleResolution } from '../types'
import { AxesText } from './text'

type Props = {
  resolution: CandleResolution
  marks: number[]
  transform: Transform
  snap?: boolean
  renderContext: RenderContext
}
export const TimeAxis = ({
  transform,
  renderContext,
  resolution,
  marks,
  snap = true,
}: Props) => {
  const { data, len } = renderContext
  function snapValue(x: number) {
    if (!snap || len === 0) return x
    return Math.min(
      Math.max((Math.round((x - 0.5 / len) * len) + 0.5) / len, 0.5 / len),
      1 - 0.5 / len
    )
  }
  let snappedMarks = useMemo(() => marks.map((x) => snapValue(x)), [marks, len])
  function format(x: number) {
    if (len === 0) return ''
    let index = Math.round(x * (len - 1))
    if (index > len - 1) return ''
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
        {snappedMarks.map((x, i) => (
          <AxesText key={i} horizontal x={x} scale={transform.scale}>
            {format(x)}
          </AxesText>
        ))}
      </div>
    </>
  )
}
