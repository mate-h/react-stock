import { RefObject, useEffect, useState } from 'react'

export function useNodeSize({ node }: { node: RefObject<SVGSVGElement> }) {
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
