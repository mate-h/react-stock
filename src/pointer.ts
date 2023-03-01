import { RefObject, useEffect, useState } from 'react'

export const usePointer = ({
  node,
}: {
  node: RefObject<HTMLElement | SVGElement>
}) => {
  // implement pointer events here
  const [state, setState] = useState({ x: 0.5, y: 0.5 })
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      // calculate the relative position to the node
      if (!node.current) return

      const rect = node.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      setState({ x, y })
    }
    window.addEventListener('pointermove', listener)
    return () => window.removeEventListener('pointermove', listener)
  }, [])
  return state
}
