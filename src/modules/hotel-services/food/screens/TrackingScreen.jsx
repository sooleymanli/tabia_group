import { AnimatePresence, motion } from 'motion/react'
import {
  CheckCircle2,
  ChefHat,
  Clock,
  PartyPopper,
  ReceiptText,
  Send,
  Star,
  XCircle,
} from 'lucide-react'
import { useScenarioDispatch, useScenarioState } from '@/demo/scenarioStore'
import { useLocalized, useT } from '@/guest-app/i18n'
import { Pressable } from '@/guest-app/ui/Pressable'
import { ScreenHeader } from '@/guest-app/ui/ScreenHeader'
import { cn } from '@/lib/utils'
import { ORDER_STATUS, formatClock, selectActiveOrder } from '../foodOrderModel'
import { getLocation } from '../menuData'

const STEPS = [
  { status: ORDER_STATUS.sent, icon: Send, timeKey: 'placedAt' },
  { status: ORDER_STATUS.accepted, icon: CheckCircle2, timeKey: 'acceptedAt' },
  { status: ORDER_STATUS.preparing, icon: ChefHat, timeKey: 'startedAt' },
  { status: ORDER_STATUS.delivered, icon: PartyPopper, timeKey: 'deliveredAt' },
]
const FEEDBACK_TAGS = ['tasty', 'onTime', 'tidy']

function StatusHero({ order }) {
  const t = useT()
  const rejected = order.status === ORDER_STATUS.rejected
  const Icon = rejected
    ? XCircle
    : STEPS.find((step) => step.status === order.status).icon
  const done = order.status === ORDER_STATUS.delivered || rejected
  const hint = rejected
    ? t(`food.reject.${order.rejectReason}`)
    : t(`food.hint.${order.status}`, {
        time: order.etaAt ? formatClock(order.etaAt) : '',
      })

  return (
    <section className="relative flex flex-col items-center gap-3 overflow-hidden rounded-3xl bg-card px-5 pt-6 pb-5 text-center">
      <div className="relative grid size-20 place-items-center">
        {!done && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-primary/25"
            animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={order.status}
            initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            className={cn(
              'relative grid size-20 place-items-center rounded-full',
              rejected
                ? 'bg-destructive text-white'
                : 'bg-primary text-primary-foreground',
            )}
          >
            <Icon className="size-9" />
          </motion.span>
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={order.status}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <p className="font-heading text-xl">
            {t(`food.status.${order.status}`)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
          {order.delays > 0 && !done && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning">
              <Clock className="size-3.5" aria-hidden="true" />
              {t('food.delayed', { time: formatClock(order.etaAt) })}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

function Timeline({ order }) {
  const t = useT()
  const reached = STEPS.findIndex((step) => step.status === order.status)

  return (
    <ol className="flex flex-col rounded-3xl bg-card px-4 py-3">
      {STEPS.map((step, index) => {
        const done = index <= reached
        const time = order[step.timeKey]
        return (
          <li key={step.status} className="relative flex gap-3 pb-4 last:pb-0">
            {index < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute start-[11px] top-6 bottom-0 w-0.5 bg-border"
              >
                <motion.span
                  className="block w-full origin-top bg-primary"
                  initial={false}
                  animate={{ height: index < reached ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              </span>
            )}
            <motion.span
              initial={false}
              animate={{ scale: index === reached ? [1, 1.25, 1] : 1 }}
              transition={{ duration: 0.4 }}
              className={cn(
                'relative grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors',
                done
                  ? 'border-primary bg-primary'
                  : 'border-border bg-background',
              )}
            >
              {done && (
                <span className="size-2 rounded-full bg-primary-foreground" />
              )}
            </motion.span>
            <span
              className={cn(
                'flex-1 text-sm',
                done ? 'font-semibold' : 'text-muted-foreground',
              )}
            >
              {t(`food.status.${step.status}`)}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {done && time != null ? formatClock(time) : ''}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function Feedback({ order }) {
  const t = useT()
  const dispatch = useScenarioDispatch()
  const { rating, tags, submitted } = order.feedback

  if (submitted) {
    return (
      <motion.p
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 rounded-3xl bg-primary/15 px-4 py-4 text-sm font-semibold text-primary"
      >
        <CheckCircle2 className="size-5 shrink-0" />
        {t('food.thanks')}
      </motion.p>
    )
  }

  return (
    <section className="flex flex-col gap-3 rounded-3xl bg-card px-4 py-4">
      <h3 className="text-sm font-semibold">{t('food.rateTitle')}</h3>
      <div
        role="radiogroup"
        aria-label={t('food.rateTitle')}
        className="flex gap-1.5"
      >
        {[1, 2, 3, 4, 5].map((value) => {
          const filled = value <= rating
          return (
            <Pressable
              key={value}
              role="radio"
              aria-checked={value === rating}
              aria-label={t('food.rateStar', { n: value })}
              data-demo-target={`rate-${value}`}
              onClick={() =>
                dispatch({
                  type: 'rateOrder',
                  orderId: order.id,
                  rating: value,
                })
              }
              className="grid size-10 place-items-center"
            >
              <motion.span
                animate={{ scale: filled ? [1, 1.3, 1] : 1 }}
                transition={{ duration: 0.3, delay: filled ? value * 0.04 : 0 }}
              >
                <Star
                  className={cn(
                    'size-7',
                    filled
                      ? 'fill-warning text-warning'
                      : 'text-muted-foreground',
                  )}
                />
              </motion.span>
            </Pressable>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {FEEDBACK_TAGS.map((tag) => {
          const active = tags.includes(tag)
          return (
            <Pressable
              key={tag}
              aria-pressed={active}
              data-demo-target={`tag-${tag}`}
              onClick={() =>
                dispatch({ type: 'toggleFeedbackTag', orderId: order.id, tag })
              }
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                active
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border',
              )}
            >
              {t(`food.tag.${tag}`)}
            </Pressable>
          )
        })}
      </div>
      <Pressable
        data-demo-target="feedback-submit"
        disabled={!rating}
        onClick={() => dispatch({ type: 'submitFeedback', orderId: order.id })}
        className="h-12 rounded-2xl bg-primary font-semibold text-primary-foreground"
      >
        {t('food.sendFeedback')}
      </Pressable>
    </section>
  )
}

export function TrackingScreen() {
  const t = useT()
  const { text, money } = useLocalized()
  const dispatch = useScenarioDispatch()
  const order = useScenarioState(selectActiveOrder)
  if (!order) return null
  const delivered = order.status === ORDER_STATUS.delivered
  const rejected = order.status === ORDER_STATUS.rejected

  return (
    <>
      <ScreenHeader
        title={t('food.order', { n: order.number })}
        trailing={
          <span className="text-sm text-muted-foreground">
            {text(getLocation(order.locationId)?.name)}
          </span>
        }
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 pb-4 *:shrink-0">
        <StatusHero order={order} />
        {rejected ? (
          <p className="flex items-center gap-3 rounded-3xl bg-secondary px-4 py-3 text-sm">
            <ReceiptText className="size-5 shrink-0 text-primary" />
            {t('food.notCharged')}
          </p>
        ) : (
          <Timeline order={order} />
        )}

        <AnimatePresence>
          {delivered && (
            <motion.div
              key="charged"
              role="status"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-3xl bg-secondary px-4 py-3 text-sm"
            >
              <ReceiptText className="size-5 shrink-0 text-primary" />
              {t('food.charged', { amount: money(order.total) })}
            </motion.div>
          )}
        </AnimatePresence>

        {delivered && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Feedback order={order} />
          </motion.div>
        )}

        {(delivered || rejected) && (
          <Pressable
            onClick={() => dispatch({ type: 'newOrder' })}
            className="rounded-2xl bg-secondary py-3 text-sm font-semibold"
          >
            {t('food.newOrder')}
          </Pressable>
        )}
      </div>
    </>
  )
}
