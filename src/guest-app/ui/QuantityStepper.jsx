import { AnimatePresence, motion } from 'motion/react'
import { Minus, Plus } from 'lucide-react'
import { useT } from '@/guest-app/i18n'
import { cn } from '@/lib/utils'
import { Pressable } from './Pressable'

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  size = 'md',
  plusTarget,
  minusTarget,
  label,
}) {
  const t = useT()
  const small = size === 'sm'
  const button = cn(
    'grid place-items-center rounded-full bg-secondary text-secondary-foreground',
    small ? 'size-8' : 'size-11',
  )

  return (
    <div
      role="group"
      aria-label={label ?? t('food.quantity')}
      className="flex items-center gap-1"
    >
      <Pressable
        data-demo-target={minusTarget}
        aria-label={t('food.decrease')}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className={button}
      >
        <Minus className={small ? 'size-3.5' : 'size-4'} />
      </Pressable>
      <span
        aria-live="polite"
        className={cn(
          'relative grid overflow-hidden text-center font-semibold tabular-nums',
          small ? 'h-8 w-7 text-sm' : 'h-11 w-10 text-lg',
        )}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={value}
            className="col-start-1 row-start-1 self-center"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 600, damping: 32 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <Pressable
        data-demo-target={plusTarget}
        aria-label={t('food.increase')}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className={cn(button, 'bg-primary text-primary-foreground')}
      >
        <Plus className={small ? 'size-3.5' : 'size-4'} />
      </Pressable>
    </div>
  )
}
