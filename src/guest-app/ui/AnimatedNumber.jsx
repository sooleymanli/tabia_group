import { useEffect } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react'

// Rolls a number to its new value so totals visibly react to cart changes.
export function AnimatedNumber({
  value,
  format = (n) => String(Math.round(n)),
  className,
}) {
  const reduceMotion = useReducedMotion()
  const motionValue = useMotionValue(value)
  const text = useTransform(motionValue, format)

  useEffect(() => {
    if (reduceMotion) {
      motionValue.set(value)
      return undefined
    }
    const controls = animate(motionValue, value, {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    })
    return () => controls.stop()
  }, [value, reduceMotion, motionValue])

  return <motion.span className={className}>{text}</motion.span>
}
