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
  const transformRef = useRef(transform)
  const [dragging, setDragging] = useState(false)
  const [mouseDown, setMouseDown] = useState(false)
  const draggingRef = useRef(dragging)
  const mouseDownRef = useRef(mouseDown)
  const originRef = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const el = node.current
    if (!el) return
    const handleMouseWheel = (ev: Event) => {
      ev.preventDefault()
      const e = ev as WheelEvent
      const dx = e.deltaX
      const dy = e.deltaY

      const isPinch = e.ctrlKey || e.metaKey
      if (isPinch) {
        setTransform((prev) => {
          const rate = -0.005
          let scale = prev.scale + dy * rate * prev.scale
          const maxScale = 10
          const minScale = 0.1
          scale = Math.max(minScale, Math.min(maxScale, scale))
          const origin = originRef.current
          const newTranform = {
            x: prev.x - (origin.x - prev.x) * (scale / prev.scale - 1),
            y: prev.y - (origin.y - prev.y) * (scale / prev.scale - 1),
            scale,
          }
          transformRef.current = newTranform
          return newTranform
        })
        return
      }

      setTransform((prev) => {
        const tx = prev.x - dx
        const ty = prev.y - dy
        const newTranform = { x: tx, y: ty, scale: prev.scale }
        transformRef.current = newTranform
        return newTranform
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
      const rect = el.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      const dx = e.movementX
      const dy = e.movementY
      originRef.current = {
        x: px,
        y: py,
      }
      // console.log('origin ', originRef.current)

      if (draggingRef.current && mouseDownRef.current) {
        ev.preventDefault()

        setTransform((prev) => {
          const nx = prev.x + dx
          const ny = prev.y + dy
          const newTranform = { x: nx, y: ny, scale: prev.scale }
          transformRef.current = newTranform
          return newTranform
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
