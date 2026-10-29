import { AnimatePresence, motion } from 'motion/react'
import { Check, QrCode, ScanLine, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useScenarioDispatch, useScenarioState } from '@/demo/scenarioStore'
import { useLocalized, useT } from '@/guest-app/i18n'
import { PrimaryAction } from '@/guest-app/ui/PrimaryAction'
import { Pressable } from '@/guest-app/ui/Pressable'
import { ScreenHeader } from '@/guest-app/ui/ScreenHeader'
import { cn } from '@/lib/utils'
import { LOCATIONS } from '../menuData'

const QR_LOCATION_ID = 'pool-b7'

function QrScanner() {
  const t = useT()
  const dispatch = useScenarioDispatch()

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
          {t('food.camera')}
        </span>
        <Pressable
          aria-label={t('food.cancel')}
          onClick={() => dispatch({ type: 'cancelQrScan' })}
          className="grid size-9 place-items-center rounded-full bg-white/15"
        >
          <X className="size-4" />
        </Pressable>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-8 bg-[radial-gradient(circle_at_50%_40%,#1f3a3a_0%,#000_70%)]">
        <div className="relative size-60">
          {/* The QR on the sunbed; tapping it stands in for the camera recognising the code. */}
          <Pressable
            aria-label={t('food.scanQr')}
            onClick={() =>
              dispatch({ type: 'completeQrScan', locationId: QR_LOCATION_ID })
            }
            className="absolute inset-6 grid place-items-center rounded-2xl bg-white p-4"
          >
            <QRCodeSVG
              value={`tabia-guest://location/${QR_LOCATION_ID}`}
              size={150}
              level="M"
            />
          </Pressable>
          {/* The camera view stays dark in both themes, so the scanner keeps a fixed mint. */}
          {[
            'top-0 left-0 border-t-4 border-l-4 rounded-tl-3xl',
            'top-0 right-0 border-t-4 border-r-4 rounded-tr-3xl',
            'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-3xl',
            'bottom-0 right-0 border-b-4 border-r-4 rounded-br-3xl',
          ].map((corner) => (
            <motion.span
              key={corner}
              aria-hidden="true"
              className={cn('absolute size-12 border-[#7fe0be]', corner)}
              animate={{ scale: [1, 0.94, 1] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
          <motion.span
            aria-hidden="true"
            className="absolute inset-x-6 top-[14%] h-0.5 rounded-full bg-[#7fe0be] shadow-[0_0_16px_4px_rgb(127_224_190/0.6)]"
            animate={{ y: [0, 172, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <p className="flex items-center gap-2 text-sm text-white/80">
          <ScanLine className="size-4" />
          {t('food.scanning')}
        </p>
      </div>
    </motion.div>
  )
}

export function LocationScreen() {
  const t = useT()
  const { text } = useLocalized()
  const dispatch = useScenarioDispatch()
  const locationId = useScenarioState((s) => s.locationId)
  const locationVia = useScenarioState((s) => s.locationVia)
  const qrScanning = useScenarioState((s) => s.qrScanning)

  return (
    <>
      <ScreenHeader
        title={t('food.locationTitle')}
        onBack={() => dispatch({ type: 'back' })}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 pb-4 *:shrink-0">
        <div
          role="radiogroup"
          aria-label={t('food.deliverTo')}
          className="flex flex-col gap-3"
        >
          {LOCATIONS.map((location) => {
            const selected = location.id === locationId
            return (
              <Pressable
                key={location.id}
                role="radio"
                aria-checked={selected}
                data-demo-target={`location-${location.id}`}
                onClick={() =>
                  dispatch({ type: 'chooseLocation', locationId: location.id })
                }
                className={cn(
                  'relative overflow-hidden rounded-3xl text-start ring-2 transition-shadow',
                  selected ? 'ring-primary' : 'ring-transparent',
                )}
              >
                <img
                  src={location.image}
                  alt=""
                  className="aspect-[16/8] w-full object-cover"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <span className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-3 text-white">
                  <span>
                    <span className="block text-base font-semibold">
                      {text(location.name)}
                    </span>
                    <span className="block text-xs text-white/75">
                      {text(location.hint)}
                    </span>
                  </span>
                  <AnimatePresence>
                    {selected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 520,
                          damping: 22,
                        }}
                        className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
                      >
                        <Check className="size-4" strokeWidth={3} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </Pressable>
            )
          })}
        </div>

        <Pressable
          data-demo-target="scan-qr"
          onClick={() => dispatch({ type: 'startQrScan' })}
          className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/50 px-4 py-3.5 text-start"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
            <QrCode className="size-5" />
          </span>
          <span className="flex-1 text-sm font-semibold">
            {t('food.scanQr')}
          </span>
          {locationVia === 'qr' && (
            <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
              {t('food.viaQr')}
            </span>
          )}
        </Pressable>
      </div>

      <PrimaryAction
        data-demo-target="to-review"
        disabled={!locationId}
        onClick={() => dispatch({ type: 'openReview' })}
      >
        {t('food.continue')}
      </PrimaryAction>

      <AnimatePresence>{qrScanning && <QrScanner />}</AnimatePresence>
    </>
  )
}
