import { RefObject, useEffect } from 'react'
import { Transform } from './scroll'

type Props = {
  transformRef: RefObject<Transform>
}
export function useInfiniteQuery({ transformRef }: Props) {
  // listen on the transformRef
  useEffect(() => {
    let cancel
    const listener = () => {
      console.log('[DEBUG] tx ', transformRef.current?.x)
      // do something with the transformRef
      cancel = requestAnimationFrame(listener)
    }
    cancel = requestAnimationFrame(listener)
    return () => {
      cancelAnimationFrame(cancel)
    }
  }, [transformRef])
}
