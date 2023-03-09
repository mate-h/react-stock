import { p } from '../lib'

export const AxesText = ({
  children,
  scale,
  x = 0,
  y = 0,
  horizontal = false,
}: {
  children: any
  x?: number
  y?: number
  horizontal?: boolean
  scale: number
}) => {
  let classes = 'h-0 flex items-center text-xs'
  if (horizontal) {
    classes =
      'flex items-center justify-center w-0 h-full text-xs h-full whitespace-nowrap'
  }
  return (
    <p
      className={classes}
      style={{
        position: 'absolute',
        top: horizontal ? undefined : p(y),
        left: horizontal ? p(x) : undefined,
        transform: horizontal ? `scaleX(${1 / scale})` : `scaleY(${1 / scale})`,
      }}
    >
      {children}
    </p>
  )
}
