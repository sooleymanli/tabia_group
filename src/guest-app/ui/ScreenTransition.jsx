import { AnimatePresence, motion } from 'motion/react'
import { useLocalized } from '@/guest-app/i18n'

// `side` is -1 in right-to-left languages, where deeper screens arrive from the left.
const offset = (percent, side) => `${percent * side}%`
const variants = {
  enter: ({ direction, side }) => ({
    x: offset(direction > 0 ? 28 : -18, side),
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: ({ direction, side }) => ({
    x: offset(direction > 0 ? -18 : 28, side),
    opacity: 0,
  }),
}

// direction: 1 = push (deeper), -1 = pop (back). Each screen fills the phone and scrolls itself.
export function ScreenTransition({ screenKey, direction = 1, children }) {
  const { dir } = useLocalized()
  const custom = { direction, side: dir === 'rtl' ? -1 : 1 }

  return (
    <AnimatePresence initial={false} custom={custom} mode="popLayout">
      <motion.div
        key={screenKey}
        custom={custom}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: 'spring', stiffness: 360, damping: 36, mass: 0.9 }}
        className="absolute inset-0 flex flex-col bg-background"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
