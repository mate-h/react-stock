import { flatten, max, min } from 'lodash'
import { RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { usePointer, useTransformedPointer } from '../pointer'
import { useScroll } from './scroll'
import { CandleDatum, CandleDelta, CandleResolution } from './types'
import { useRenderContext, p } from './lib'

type Props = {
  chunks: CandleDatum[][]
  delta?: CandleDelta
  resolution: CandleResolution
  children: any
  node: RefObject<SVGSVGElement>
}

export const ChartLines = ({ node }: Pick<Props, 'node'>) => {
  const { x: lx, y: ly } = usePointer({ node })
  return (
    <g>
      <line
        x1={p(lx)}
        y1="0%"
        x2={p(lx)}
        y2="100%"
        className="stroke-medium"
        strokeWidth={1}
        strokeDasharray={4}
      />
      <line
        x1="0"
        y1={p(ly)}
        x2="100%"
        y2={p(ly)}
        className="stroke-medium"
        strokeWidth={1}
        strokeDasharray={4}
      />
    </g>
  )
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

    const Text = ({ children, y }: { children: any; y: number }) => (
      <p
        className="h-0 flex items-center text-xs"
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
          <Text y={y}>{ycurr.toFixed(2)}</Text>
          <Text y={y2}>{y2curr.toFixed(2)}</Text>
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
    const Text = ({ children, x }: { children: any; x: number }) => (
      <p
        className="flex items-center justify-center w-0 h-full text-xs h-full whitespace-nowrap"
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
          className="px-1 relative w-full h-6 border-t border-divider bg-well"
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
