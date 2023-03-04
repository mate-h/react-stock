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
  const touchPanRef = useRef(false)
  const touchZoomRef = useRef(false)
  const touchDecelerateRef = useRef(false)
  const prevPointerRef = useRef({ x: 0, y: 0 })
  const velocityRef = useRef({ x: 0, y: 0 })
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
      } else if (e.button === 1 && !mouseDownRef.current) {
        mouseDownRef.current = true
        draggingRef.current = true
        setDragging(true)
        setMouseDown(true)
      }
    }
    const pointerUp = (ev: Event) => {
      const e = ev as PointerEvent
      if (e.button === 0 && mouseDownRef.current) {
        setMouseDown(false)
        mouseDownRef.current = false
      } else if (e.button === 1 && mouseDownRef.current) {
        mouseDownRef.current = false
        draggingRef.current = false
        setDragging(false)
        setMouseDown(false)
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

    const touchStart = (ev: Event) => {
      const e = ev as TouchEvent
      if (e.touches.length === 2) {
        // Zoom gesture
        touchZoomRef.current = true
        const t1 = e.touches[0]
        const t2 = e.touches[1]
        const rect = el.getBoundingClientRect()
        const p1 = {
          x: t1.clientX - rect.left,
          y: t1.clientY - rect.top,
        }
        const p2 = {
          x: t2.clientX - rect.left,
          y: t2.clientY - rect.top,
        }
        const center = {
          x: (p1.x + p2.x) / 2,
          y: (p1.y + p2.y) / 2,
        }
        originRef.current = center
      } else {
        // Pan gesture
        touchPanRef.current = true
        const rect = el.getBoundingClientRect()
        originRef.current = {
          x: e.touches[0].clientX - rect.left - transformRef.current.x,
          y: e.touches[0].clientY - rect.top - transformRef.current.y,
        }
      }
    }
    const touchMove = (ev: Event) => {
      const e = ev as TouchEvent
      if (touchPanRef.current) {
        // Pan gesture
        ev.preventDefault()
        const t1 = e.touches[0]
        const rect = el.getBoundingClientRect()
        const o = originRef.current
        const delta = {
          x: t1.clientX - rect.left,
          y: t1.clientY - rect.top,
        }
        const p = prevPointerRef.current
        const velocity = {
          x: delta.x - p.x,
          y: delta.y - p.y,
        }
        velocityRef.current = velocity
        prevPointerRef.current = delta
        setTransform((prev) => {
          const nx = o.x - delta.x
          const ny = o.y - delta.y
          const newTranform = { x: -nx, y: -ny, scale: prev.scale }
          transformRef.current = newTranform
          return newTranform
        })
      }
      if (e.touches.length === 2) {
        ev.preventDefault()
        const t1 = e.touches[0]
        const t2 = e.touches[1]
        const rect = el.getBoundingClientRect()
        const p1 = {
          x: t1.clientX - rect.left,
          y: t1.clientY - rect.top,
        }
        const p2 = {
          x: t2.clientX - rect.left,
          y: t2.clientY - rect.top,
        }
        const center = {
          x: (p1.x + p2.x) / 2,
          y: (p1.y + p2.y) / 2,
        }
        const dx = center.x - originRef.current.x
        const dy = center.y - originRef.current.y
        setTransform((prev) => {
          const nx = prev.x + dx
          const ny = prev.y + dy
          const newTranform = { x: nx, y: ny, scale: prev.scale }
          transformRef.current = newTranform
          return newTranform
        })
      }
    }
    const touchEnd = (ev: Event) => {
      const e = ev as TouchEvent
      if (touchPanRef) {
        touchDecelerateRef.current = true
      }
    }
    const isTouch = 'ontouchstart' in window
    let cancelAnimation: number
    const animate = () => {
      if (!isTouch) return
      const v = velocityRef.current
      const dx = v.x
      const dy = v.y
      const damping = 0.9
      velocityRef.current = { x: dx * damping, y: dy * damping }
      const nx = transformRef.current.x + dx
      const ny = transformRef.current.y + dy
      setTransform((prev) => {
        const newTranform = { x: nx, y: ny, scale: prev.scale }
        transformRef.current = newTranform
        return newTranform
      })
      cancelAnimation = requestAnimationFrame(animate)
    }
    animate()

    el.addEventListener('mousewheel', handleMouseWheel)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    if (isTouch) {
      el.addEventListener('touchstart', touchStart)
      el.addEventListener('touchmove', touchMove)
    } else {
      window.addEventListener('pointermove', pointerMove)
      el.addEventListener('pointerdown', pointerDown)
      el.addEventListener('pointerup', pointerUp)
    }

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

      if (isTouch) {
        el.removeEventListener('touchstart', touchStart)
        el.removeEventListener('touchmove', touchMove)
      } else {
        window.removeEventListener('pointermove', pointerMove)
        el.removeEventListener('pointerdown', pointerDown)
        el.removeEventListener('pointerup', pointerUp)
      }

      cancelAnimationFrame(cancelAnimation)

      el.removeEventListener('pointermove', updateCursor)
      el.removeEventListener('pointerdown', updateCursor)
      el.removeEventListener('pointerup', updateCursor)
      window.removeEventListener('keydown', updateCursor)
      window.removeEventListener('keyup', updateCursor)
    }
  }, [node])
  return transform
}
