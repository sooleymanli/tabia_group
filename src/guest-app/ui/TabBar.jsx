import { useId } from 'react'
import { LayoutGroup, motion } from 'motion/react'
import { useT } from '@/guest-app/i18n'
import { cn } from '@/lib/utils'
import { Pressable } from './Pressable'

// items: [{ id, icon: LucideIcon, labelKey, badge? }]
export function TabBar({ items, value, onChange, className }) {
  const t = useT()
  const groupId = useId()

  return (
    <LayoutGroup id={groupId}>
      <nav
        aria-label="Tabia Guest"
        className={cn(
          'flex shrink-0 items-stretch justify-around border-t border-border bg-background/85 px-2 pt-1.5 pb-1 backdrop-blur-xl',
          className,
        )}
      >
        {items.map(({ id, icon: Icon, labelKey, badge }) => {
          const active = id === value
          return (
            <Pressable
              key={id}
              data-demo-target={`tab-${id}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => onChange(id)}
              className={cn(
                'relative isolate flex min-w-14 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[11px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {active && (
                <motion.span
                  layoutId="tab-indicator"
                  className="absolute inset-x-0.5 inset-y-0 -z-10 rounded-xl bg-primary/12"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">
                <Icon
                  className="size-[22px]"
                  strokeWidth={active ? 2.3 : 1.9}
                />
                {badge > 0 && (
                  <motion.span
                    key={badge}
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 18 }}
                    className="absolute -end-2.5 -top-1.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] leading-4 font-semibold text-primary-foreground tabular-nums"
                  >
                    {badge}
                  </motion.span>
                )}
              </span>
              {t(labelKey)}
            </Pressable>
          )
        })}
      </nav>
    </LayoutGroup>
  )
}
