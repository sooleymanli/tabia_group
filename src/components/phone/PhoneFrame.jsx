import { useEffect, useRef } from 'react'
import { BatteryFull, Signal, Wifi } from 'lucide-react'
import { getLocale, useGuestLocale } from '@/guest-app/i18n'
import { SettingsSheet } from '@/guest-app/ui/GuestSettings'
import { cn } from '@/lib/utils'
import { useFitScale } from './useFitScale'

const SCREEN_WIDTH = 390
const SCREEN_HEIGHT = 844
const BEZEL = 12
const FRAME_WIDTH = SCREEN_WIDTH + BEZEL * 2
const FRAME_HEIGHT = SCREEN_HEIGHT + BEZEL * 2

function StatusBar() {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-12 shrink-0 items-center justify-between px-8 pt-1 text-[15px] font-semibold text-foreground"
    >
      <span>9:41</span>
      <span className="absolute top-2.5 left-1/2 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />
      <span className="flex items-center gap-1.5">
        <Signal className="size-4" strokeWidth={2.5} />
        <Wifi className="size-4" strokeWidth={2.5} />
        <BatteryFull className="size-5" strokeWidth={2} />
      </span>
    </div>
  )
}

// Renders children at real iPhone size (390×844) and scales the whole device to fit its container.
// Children own their scrolling so screens can pin tab bars and sheets; `overlay` spans the whole screen.
export function PhoneFrame({
  children,
  overlay,
  className,
  label = 'Qonaq tətbiqi',
}) {
  const containerRef = useRef(null)
  const scale = useFitScale(containerRef, FRAME_WIDTH, FRAME_HEIGHT)
  const theme = useGuestLocale((state) => state.theme)
  const locale = useGuestLocale((state) => state.locale)
  const closeSettings = useGuestLocale((state) => state.closeSettings)

  // The sheet state is global; leaving a slide must not carry an open sheet to the next one.
  useEffect(() => closeSettings, [closeSettings])

  return (
    <div
      ref={containerRef}
      className={cn(
        'grid size-full min-h-0 min-w-0 place-items-center',
        className,
      )}
    >
      <div style={{ width: FRAME_WIDTH * scale, height: FRAME_HEIGHT * scale }}>
        <div
          className="origin-top-left rounded-[58px] bg-[#1a2526] shadow-[0_24px_60px_-24px_rgb(15_61_62/0.55)] ring-1 ring-black/40"
          style={{
            width: FRAME_WIDTH,
            height: FRAME_HEIGHT,
            padding: BEZEL,
            transform: `scale(${scale})`,
          }}
        >
          <section
            aria-label={label}
            data-keyboard-isolated
            data-comment-area="phone"
            lang={locale}
            dir={getLocale(locale).dir}
            className={cn(
              'guest-app relative flex size-full flex-col overflow-hidden rounded-[46px] bg-background text-foreground transition-colors duration-300',
              theme === 'dark' && 'dark',
            )}
          >
            <StatusBar />
            <div className="relative min-h-0 flex-1 overflow-hidden">
              {children}
            </div>
            <div
              aria-hidden="true"
              className="flex h-7 shrink-0 items-center justify-center"
            >
              <span className="h-1.5 w-32 rounded-full bg-foreground/70" />
            </div>
            <SettingsSheet />
            {overlay}
          </section>
        </div>
      </div>
    </div>
  )
}
