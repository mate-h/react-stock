import { RefObject } from 'react'
import { usePointer } from '../pointer'
import { p } from './lib'

type Props = {
  node: RefObject<SVGSVGElement>
}
export const ChartLines = ({ node }: Props) => {
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
