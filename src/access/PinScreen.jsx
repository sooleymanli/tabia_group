import { useId, useRef, useState } from 'react'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { BRAND } from '@/config/brand'
import { cn } from '@/lib/utils'
import { BrandPanel } from '@/presentation/BrandPanel'
import { ACCESS, NOTICE, accessStore, useAccess } from './accessStore'

const PIN_LENGTH = 4

const PIN_ERRORS = {
  invalid_pin: 'PIN yanlışdır və ya artıq etibarlı deyil. Yenidən yoxlayın.',
  too_many_attempts:
    'Çox sayda yanlış cəhd edildi. 15 dəqiqə sonra yenidən cəhd edin.',
  temporarily_locked:
    'Giriş müvəqqəti dayandırılıb. Bir neçə dəqiqə sonra yenidən cəhd edin.',
  auth_failed: 'Giriş sessiyası yaradılmadı. Bir az sonra yenidən cəhd edin.',
}
const NETWORK_ERROR =
  'Serverə qoşulmaq alınmadı. İnternet bağlantısını yoxlayıb yenidən cəhd edin.'

const NOTICES = {
  [NOTICE.ended]:
    'Giriş müddəti bitib və ya PIN deaktiv edilib. Yeni PIN üçün Developer Team-ə müraciət edin.',
  [NOTICE.signedOut]: 'Təqdimatdan çıxdınız.',
}

const VISIBILITY_OPTIONS = [
  {
    value: 'vendor',
    title: 'Yalnız Developer Team',
    description: 'Rəylərinizi yalnız Developer Team və siz görürsünüz.',
    recommended: true,
  },
  {
    value: 'public',
    title: 'PIN ilə daxil olan hər kəs',
    description:
      'Tabia komandasının nümayəndələri də daxil olmaqla, PIN ilə daxil olan hər kəs adınızı və rəyinizi görə bilər. PIN göstərilmir, amma mətnə yazdığınız şəxsi məlumatlar görünür.',
  },
]

export function GateLayout({ children }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <title>{`Giriş – ${BRAND.productName}`}</title>
      <BrandPanel />
      <main className="flex flex-col justify-center px-6 py-12 md:px-10 lg:px-14">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}

const stepMotion = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.22, ease: 'easeOut' },
}

export function PinScreen() {
  const status = useAccess((state) => state.status)
  const step = status === ACCESS.chooseVisibility ? 'visibility' : 'pin'

  return (
    <GateLayout>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={step} {...stepMotion}>
          {step === 'pin' ? <PinStep /> : <VisibilityStep />}
        </motion.div>
      </AnimatePresence>
    </GateLayout>
  )
}

function PinStep() {
  const notice = useAccess((state) => state.notice)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [pending, setPending] = useState(false)
  const pendingRef = useRef(false)
  const errorId = useId()

  const submit = async (value) => {
    if (pendingRef.current || value.length !== PIN_LENGTH) return
    pendingRef.current = true
    setPending(true)
    setError(null)
    const code = await accessStore.getState().submitPin(value)
    pendingRef.current = false
    setPending(false)
    if (code) {
      setError(PIN_ERRORS[code] ?? NETWORK_ERROR)
      setAttempt((n) => n + 1)
      setPin('')
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit(pin)
      }}
    >
      <h2 className="font-heading text-2xl font-medium text-ink md:text-3xl">
        Təqdimata giriş
      </h2>
      <p className="mt-3 text-muted-foreground">
        Developer Team-in sizə verdiyi 4 rəqəmli PIN-i yazın.
      </p>

      {notice && NOTICES[notice] && (
        <p
          role="status"
          className="mt-6 rounded-lg border border-petrol-soft/30 bg-secondary px-4 py-3 text-sm text-ink"
        >
          {NOTICES[notice]}
        </p>
      )}

      <motion.div
        key={attempt}
        className="mt-8"
        animate={attempt > 0 ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
        transition={{ duration: 0.36 }}
      >
        <InputOTP
          maxLength={PIN_LENGTH}
          value={pin}
          onChange={(value) => {
            setPin(value)
            if (error) setError(null)
          }}
          onComplete={submit}
          pattern={REGEXP_ONLY_DIGITS}
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          aria-label="PIN"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        >
          <InputOTPGroup className="gap-3">
            {Array.from({ length: PIN_LENGTH }, (_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                aria-invalid={error ? true : undefined}
                className="size-16 rounded-xl border bg-card font-heading text-3xl text-ink first:rounded-xl last:rounded-xl data-[active=true]:border-petrol md:size-[4.5rem]"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </motion.div>

      <p
        id={errorId}
        role="alert"
        className="mt-3 min-h-10 text-sm text-destructive"
      >
        {error}
      </p>

      <Button
        type="submit"
        size="lg"
        className="mt-2 w-full sm:w-auto sm:min-w-40"
        disabled={pending || pin.length !== PIN_LENGTH}
      >
        {pending ? 'Yoxlanılır…' : 'Daxil ol'}
      </Button>

      <p className="mt-12 text-sm text-muted-foreground">
        Developer Team üzvüsünüz?{' '}
        <Link
          to="/admin"
          className="rounded-sm font-medium text-petrol-soft underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Hesabla daxil olun
        </Link>
      </p>
    </form>
  )
}

function VisibilityStep() {
  const [choice, setChoice] = useState('vendor')
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)
  const name = useId()

  const submit = async (event) => {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setError(null)
    const code = await accessStore.getState().chooseVisibility(choice)
    setPending(false)
    if (code) setError(NETWORK_ERROR)
  }

  return (
    <form onSubmit={submit}>
      <h2 className="font-heading text-2xl font-medium text-ink md:text-3xl">
        Rəylərinizi kim görsün?
      </h2>
      <p className="mt-3 text-muted-foreground">
        Təqdimat boyu slaydları bəyənə və rəy yaza bilərsiniz. Seçim yazacağınız
        yeni rəylərə tətbiq olunur.
      </p>

      <fieldset className="mt-8 grid gap-3">
        <legend className="sr-only">Rəylərin görünməsi</legend>
        {VISIBILITY_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex cursor-pointer gap-4 rounded-xl border bg-card p-4 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
              choice === option.value
                ? 'border-petrol bg-secondary/60'
                : 'hover:border-petrol-soft/50',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={choice === option.value}
              onChange={() => setChoice(option.value)}
              className="mt-1 size-4 shrink-0 accent-petrol"
            />
            <span>
              <span className="flex flex-wrap items-center gap-2 font-medium text-ink">
                {option.title}
                {option.recommended && (
                  <Badge variant="outline" className="font-normal">
                    Tövsiyə olunur
                  </Badge>
                )}
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                {option.description}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <p role="alert" className="mt-3 min-h-10 text-sm text-destructive">
        {error}
      </p>

      <Button
        type="submit"
        size="lg"
        className="mt-2 w-full sm:w-auto sm:min-w-40"
        disabled={pending}
      >
        {pending ? 'Saxlanılır…' : 'Davam et'}
      </Button>
    </form>
  )
}
