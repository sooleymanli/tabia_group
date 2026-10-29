import { useEffect, useId, useRef } from 'react'
import { AnimatePresence, motion, useDragControls } from 'motion/react'
import { X } from 'lucide-react'
import { useT } from '@/guest-app/i18n'
import { Pressable } from './Pressable'

const DISMISS_OFFSET = 110
const DISMISS_VELOCITY = 600

// Sheet scoped to the phone screen (not a body portal), so it scales with the device frame.
export function BottomSheet({ open, onClose, title, children }) {
  const t = useT()
  const titleId = useId()
  const sheetRef = useRef(null)
  const dragControls = useDragControls()

  useEffect(() => {
    if (!open) return undefined
    const previous = document.activeElement
    // The sheet starts off-screen; a plain focus() would scroll the phone and page to it.
    sheetRef.current?.focus({ preventScroll: true })
    return () => {
      if (previous instanceof HTMLElement)
        previous.focus({ preventScroll: true })
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-40">
          <motion.button
            type="button"
            aria-label={t('action.close')}
            tabIndex={-1}
            className="absolute inset-0 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === 'Escape') onClose()
            }}
            className="absolute inset-x-0 bottom-0 flex max-h-[88%] flex-col rounded-t-[28px] border-t border-border bg-popover text-popover-foreground shadow-[0_-12px_40px_rgb(0_0_0/0.45)] outline-none"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(event, info) => {
              if (
                info.offset.y > DISMISS_OFFSET ||
                info.velocity.y > DISMISS_VELOCITY
              )
                onClose()
            }}
          >
            <div
              className="flex cursor-grab touch-none justify-center pt-2.5 pb-1 active:cursor-grabbing"
              onPointerDown={(event) => dragControls.start(event)}
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-10 rounded-full bg-foreground/20"
              />
            </div>
            <div className="flex items-center gap-3 px-5 pt-1 pb-3">
              <h2
                id={titleId}
                className="flex-1 font-sans text-lg font-semibold"
              >
                {title}
              </h2>
              <Pressable
                onClick={onClose}
                aria-label={t('action.close')}
                className="grid size-9 place-items-center rounded-full bg-secondary text-secondary-foreground"
              >
                <X className="size-4" />
              </Pressable>
            </div>
            <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
