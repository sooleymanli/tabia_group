import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

// Shows where autoplay "taps": a ring at the element marked with data-demo-target="<step.target>".
export function DemoTouchIndicator({ player }) {
  const layerRef = useRef(null)
  const [tap, setTap] = useState(null)

  useEffect(() => {
    if (!player) return undefined
    return player.onStep((step) => {
      const layer = layerRef.current
      const root = layer?.parentElement
      if (!step?.target || !root) return
      const target = root.querySelector(
        `[data-demo-target="${CSS.escape(step.target)}"]`,
      )
      if (!target) return
      target.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      const rootRect = root.getBoundingClientRect()
      const rect = target.getBoundingClientRect()
      // The phone is CSS-scaled; convert screen pixels back to the phone's own coordinates.
      const scale = rootRect.width / root.offsetWidth || 1
      setTap({
        id: `${step.id}-${Date.now()}`,
        x: (rect.left + rect.width / 2 - rootRect.left) / scale,
        y: (rect.top + rect.height / 2 - rootRect.top) / scale,
      })
    })
  }, [player])

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-50 overflow-hidden"
    >
      <AnimatePresence>
        {tap && (
          <motion.span
            key={tap.id}
            className="absolute size-11 rounded-full border-2 border-primary bg-primary/25"
            style={{ left: tap.x - 22, top: tap.y - 22 }}
            initial={{ scale: 1.6, opacity: 0 }}
            animate={{ scale: [1.6, 0.85, 1], opacity: [0, 1, 1] }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onAnimationComplete={() =>
              setTap((current) => (current?.id === tap.id ? null : current))
            }
          />
        )}
      </AnimatePresence>
    </div>
  )
}
