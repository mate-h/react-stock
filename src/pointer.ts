import { RefObject, useEffect, useState } from 'react'

export const usePointer = ({
  node,
  transformRef,
}: {
  node: RefObject<HTMLElement | SVGElement>
  transformRef: RefObject<{ x: number; y: number; scale: number }>
}) => {
  // implement pointer events here
  const [state, setState] = useState({ x: 0.5, y: 0.5 })
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      // calculate the relative position to the node
      if (!node.current) return

      const rect = node.current.getBoundingClientRect()
      const tx = transformRef.current!.x
      const ty = transformRef.current!.y
      const s = transformRef.current!.scale
      let x = (e.clientX - rect.left - tx) / s
      let y = (e.clientY - rect.top - ty) / s
      // normalize
      x = x / rect.width
      y = y / rect.height
      setState({ x, y })
    }
    window.addEventListener('pointermove', listener)
    return () => window.removeEventListener('pointermove', listener)
  }, [])
  return state
}
