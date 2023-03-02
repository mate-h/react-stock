import { RefObject, useEffect, useRef, useState } from 'react'

export function useScroll({
  node,
}: {
  node: RefObject<HTMLElement | SVGElement>
}) {
  const [transform, setTransform] = useState({
    x: 0,
    y: 0,
    scale: 1,
  })
  const [dragging, setDragging] = useState(false)
  const [mouseDown, setMouseDown] = useState(false)
  const draggingRef = useRef(dragging)
  const mouseDownRef = useRef(mouseDown)
  useEffect(() => {
    const el = node.current
    if (!el) return
    const handleMouseWheel = (ev: Event) => {
      ev.preventDefault()
      const e = ev as WheelEvent
      const dx = e.deltaX
      const dy = e.deltaY

      setTransform((prev) => {
        const scale = prev.scale + e.deltaY * -0.01
        const tx = prev.x - dx
        const ty = prev.y - dy
        return { x: tx, y: ty, scale: 1 }
      })
    }
    function setCursor(c: string) {
      const el = node.current
      if (!el) return
      el.style.cursor = c
    }
    function updateCursor() {
      if (draggingRef.current && mouseDownRef.current) {
        setCursor('grabbing')
      } else if (draggingRef.current) {
        setCursor('grab')
      } else {
        setCursor('default')
      }
    }
    const pointerMove = (ev: Event) => {
      const e = ev as PointerEvent
      if (draggingRef.current && mouseDownRef.current) {
        ev.preventDefault()
        setTransform((prev) => {
          const tx = prev.x + e.movementX
          const ty = prev.y + e.movementY
          return { x: tx, y: ty, scale: prev.scale }
        })
      }
    }
    const pointerDown = (ev: Event) => {
      const e = ev as PointerEvent
      if (e.button === 0 && !mouseDownRef.current) {
        setMouseDown(true)
        mouseDownRef.current = true
      }
    }
    const pointerUp = (ev: Event) => {
      const e = ev as PointerEvent
      if (e.button === 0 && mouseDownRef.current) {
        setMouseDown(false)
        mouseDownRef.current = false
      }
    }
    const handleKeyDown = (ev: Event) => {
      const e = ev as KeyboardEvent
      // if space
      if (e.key === ' ' && !draggingRef.current) {
        setDragging(true)
        draggingRef.current = true
      }
    }
    const handleKeyUp = (ev: Event) => {
      const e = ev as KeyboardEvent
      // if space
      if (e.key === ' ' && draggingRef.current) {
        setDragging(false)
        draggingRef.current = false
      }
    }

    el.addEventListener('mousewheel', handleMouseWheel)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('pointermove', pointerMove)
    el.addEventListener('pointerdown', pointerDown)
    el.addEventListener('pointerup', pointerUp)

    // on any event, update the cursor
    el.addEventListener('pointermove', updateCursor)
    el.addEventListener('pointerdown', updateCursor)
    el.addEventListener('pointerup', updateCursor)
    window.addEventListener('keydown', updateCursor)
    window.addEventListener('keyup', updateCursor)

    return () => {
      el.removeEventListener('mousewheel', handleMouseWheel)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('pointermove', pointerMove)
      el.removeEventListener('pointerdown', pointerDown)
      el.removeEventListener('pointerup', pointerUp)

      el.removeEventListener('pointermove', updateCursor)
      el.removeEventListener('pointerdown', updateCursor)
      el.removeEventListener('pointerup', updateCursor)
      window.removeEventListener('keydown', updateCursor)
      window.removeEventListener('keyup', updateCursor)
    }
  }, [node])
  return transform
}
