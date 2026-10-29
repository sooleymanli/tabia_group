import { useLayoutEffect, useState } from 'react'

// Largest scale (capped at 1) at which a fixed-size box fits inside the measured container.
export function useFitScale(containerRef, width, height) {
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return undefined

    const observer = new ResizeObserver(([entry]) => {
      const { width: availableWidth, height: availableHeight } =
        entry.contentRect
      if (!availableWidth || !availableHeight) return
      setScale(Math.min(1, availableWidth / width, availableHeight / height))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [containerRef, width, height])

  return scale
}
