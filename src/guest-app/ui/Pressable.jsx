import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

// Tap feedback for every interactive surface in the guest app.
export function Pressable({ className, type = 'button', children, ...props }) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 520, damping: 30 }}
      className={cn(
        'outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
