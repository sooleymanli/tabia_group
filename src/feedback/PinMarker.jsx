import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

// Teardrop with the sharp corner on the commented point, as in Figma.
const shape =
  'flex items-center justify-center rounded-full rounded-bl-none font-semibold tabular-nums shadow-md ring-2 ring-white'

// Resolved pins turn green so the client sees at a glance which remarks were handled.
const tone = (own, active, resolved) =>
  cn(
    resolved
      ? 'bg-success text-white'
      : own
        ? 'bg-petrol text-mist'
        : 'bg-petrol-soft text-white',
    active && 'ring-3 ring-mint',
  )

export function PinBadge({ number, own, resolved, active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        shape,
        tone(own, active, resolved),
        'size-6 text-[11px] outline-none focus-visible:ring-3 focus-visible:ring-ring/60',
      )}
    >
      {number}
    </button>
  )
}

export function PinMarker({
  position,
  number,
  own,
  resolved,
  active,
  draft,
  label,
  onClick,
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      initial={{ scale: 0 }}
      animate={{ scale: active ? 1.15 : 1 }}
      transition={{ type: 'spring', stiffness: 520, damping: 24 }}
      style={{ left: position.left, top: position.top, originX: 0, originY: 1 }}
      className={cn(
        shape,
        'pointer-events-auto absolute -translate-y-full text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/60',
        draft
          ? 'size-8 bg-pomegranate text-white'
          : cn('size-7', tone(own, active, resolved)),
      )}
    >
      {draft ? '+' : number}
    </motion.button>
  )
}
