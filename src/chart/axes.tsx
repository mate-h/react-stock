import { RefObject, useEffect, useMemo, useRef } from 'react'
import { useTransformedPointer } from '../pointer'
import { useScroll } from './scroll'
import { CandleDatum, CandleDelta, CandleResolution } from './types'
import { useRenderContext } from './render-context'
import { ChartLines } from './lines'
import { AxesText } from './axes-text'

type Props = {
  chunks: CandleDatum[][]
  delta?: CandleDelta
  resolution: CandleResolution
  children: any
  node: RefObject<SVGSVGElement>
}

export const ChartAxes = ({
  node,
  chunks,
  delta,
  resolution,
  children,
}: Props) => {
  const { data, len, ynorm, ymin, ymax } = useRenderContext(
    chunks[0],
    resolution
  )

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

  let xSnapped = useMemo(
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
          <AxesText y={y} scale={transform.scale}>
            {ycurr.toFixed(2)}
          </AxesText>
          <AxesText y={y2} scale={transform.scale}>
            {y2curr.toFixed(2)}
          </AxesText>
        </div>
        <div className="h-6 bg-well" />
      </div>
    )
  }

  const TimeAxis = () => {
    function format() {
      if (len === 0) return ''
      let index = Math.round(xSnapped * (len - 1))
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
          <AxesText horizontal x={xSnapped} scale={transform.scale}>
            {format()}
          </AxesText>
        </div>
      </>
    )
  }

  return (
    <div className="w-full h-full relative flex">
      <div className="relative flex-1 flex flex-col">
        <svg className="w-full h-full" ref={node}>
          {children}
          <ChartLines node={node} />
        </svg>
        <TimeAxis />
      </div>
      <PriceAxis />
    </div>
  )
}
