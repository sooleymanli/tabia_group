import { cn } from '@/lib/utils'
import { Pressable } from './Pressable'

// Bottom-docked main action of a screen, inside the thumb zone.
export function PrimaryAction({ className, children, ...props }) {
  return (
    <div className="shrink-0 border-t border-border bg-background/90 px-4 pt-3 pb-2 backdrop-blur-xl">
      <Pressable
        className={cn(
          'flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-base font-semibold text-primary-foreground',
          className,
        )}
        {...props}
      >
        {children}
      </Pressable>
    </div>
  )
}
