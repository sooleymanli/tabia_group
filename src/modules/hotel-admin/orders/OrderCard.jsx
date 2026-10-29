import { useState } from 'react'
import { motion } from 'motion/react'
import {
  Check,
  ChefHat,
  Clock,
  ConciergeBell,
  MapPin,
  Smartphone,
  Star,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useScenarioDispatch } from '@/demo/scenarioStore'
import { formatMoney } from '@/guest-app/i18n'
import { cn } from '@/lib/utils'
import {
  DELAY_MINUTES,
  ETA_CHOICES,
  ORDER_STATUS,
  REJECT_REASONS,
  formatClock,
} from '@/modules/hotel-services/food/foodOrderModel'
import {
  DEPARTMENT_LABELS,
  REJECT_LABELS,
  STATUS_LABELS,
  orderGuest,
  orderLines,
  orderPlace,
} from './orderBoard'

const STATUS_TONE = {
  [ORDER_STATUS.sent]: 'bg-pomegranate text-white',
  [ORDER_STATUS.accepted]: 'bg-secondary text-petrol',
  [ORDER_STATUS.preparing]: 'bg-petrol text-mist',
  [ORDER_STATUS.delivered]: 'bg-success/15 text-success',
  [ORDER_STATUS.rejected]: 'bg-muted text-muted-foreground',
}

function SentActions({ order, dispatch }) {
  const [eta, setEta] = useState(25)
  const [rejecting, setRejecting] = useState(false)

  if (rejecting) {
    return (
      <div className="grid gap-1.5">
        <p className="text-xs text-muted-foreground">Rədd səbəbi</p>
        <div className="flex flex-wrap gap-1.5">
          {REJECT_REASONS.map((reason) => (
            <Button
              key={reason}
              size="xs"
              variant="outline"
              onClick={() =>
                dispatch({ type: 'hotelReject', orderId: order.id, reason })
              }
            >
              {REJECT_LABELS[reason]}
            </Button>
          ))}
          <Button size="xs" variant="ghost" onClick={() => setRejecting(false)}>
            Geri
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div
        role="radiogroup"
        aria-label="Təxmini vaxt"
        className="flex rounded-lg border p-0.5"
      >
        {ETA_CHOICES.map((minutes) => (
          <button
            key={minutes}
            type="button"
            role="radio"
            aria-checked={eta === minutes}
            onClick={() => setEta(minutes)}
            className={cn(
              'rounded-md px-1.5 py-0.5 text-xs tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
              eta === minutes
                ? 'bg-petrol text-mist'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {minutes} dəq
          </button>
        ))}
      </div>
      <Button
        size="sm"
        data-demo-target={`admin-accept-${order.number}`}
        onClick={() =>
          dispatch({ type: 'hotelAccept', orderId: order.id, etaMinutes: eta })
        }
      >
        <Check data-icon="inline-start" />
        Qəbul et
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setRejecting(true)}>
        <X data-icon="inline-start" />
        Rədd et
      </Button>
    </div>
  )
}

function ActiveActions({ order, dispatch }) {
  const preparing = order.status === ORDER_STATUS.preparing
  return (
    <div className="flex flex-wrap gap-1.5">
      {preparing ? (
        <Button
          size="sm"
          data-demo-target={`admin-deliver-${order.number}`}
          onClick={() => dispatch({ type: 'hotelDeliver', orderId: order.id })}
        >
          <ConciergeBell data-icon="inline-start" />
          Çatdırıldı
        </Button>
      ) : (
        <Button
          size="sm"
          data-demo-target={`admin-start-${order.number}`}
          onClick={() => dispatch({ type: 'hotelStart', orderId: order.id })}
        >
          <ChefHat data-icon="inline-start" />
          İcraya başla
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        data-demo-target={`admin-delay-${order.number}`}
        onClick={() => dispatch({ type: 'hotelDelay', orderId: order.id })}
      >
        <Clock data-icon="inline-start" />+{DELAY_MINUTES} dəq
      </Button>
    </div>
  )
}

// One request as the restaurant sees it; every button dispatches the same action autoplay uses.
export function OrderCard({ order, className }) {
  const dispatch = useScenarioDispatch()
  const guest = orderGuest(order)
  const active =
    order.status === ORDER_STATUS.accepted ||
    order.status === ORDER_STATUS.preparing

  return (
    <motion.article
      layout="position"
      layoutId={order.id}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      aria-label={`Sifariş #${order.number}`}
      className={cn(
        'grid gap-2.5 rounded-xl border bg-background p-3 text-sm',
        guest && 'ring-2 ring-mint',
        className,
      )}
    >
      <header className="flex flex-wrap items-center gap-1.5">
        <span className="font-semibold text-ink tabular-nums">
          #{order.number}
        </span>
        <Badge variant="outline" className="font-normal">
          {DEPARTMENT_LABELS[order.department]}
        </Badge>
        <span
          className={cn(
            'ml-auto rounded-full px-2 py-0.5 text-xs font-medium',
            STATUS_TONE[order.status],
          )}
        >
          {STATUS_LABELS[order.status]}
        </span>
      </header>

      <div className="grid gap-0.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3.5" aria-hidden="true" />
          {orderPlace(order)}
        </span>
        {guest && (
          <span className="inline-flex items-center gap-1 font-medium text-petrol">
            <Smartphone className="size-3.5" aria-hidden="true" />
            {guest}, telefondakı demo
          </span>
        )}
      </div>

      <ul className="grid gap-0.5 text-ink">
        {orderLines(order).map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>

      <dl className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground tabular-nums">
        <div className="flex gap-1">
          <dt>Məbləğ</dt>
          <dd className="font-medium text-ink">
            {formatMoney(order.total, 'az')}
          </dd>
        </div>
        <div className="flex gap-1">
          <dt>Gəlib</dt>
          <dd>{formatClock(order.placedAt)}</dd>
        </div>
        {order.etaAt != null && order.status !== ORDER_STATUS.rejected && (
          <div className="flex gap-1">
            <dt>{order.deliveredAt != null ? 'Çatdı' : 'Təxmini'}</dt>
            <dd>{formatClock(order.deliveredAt ?? order.etaAt)}</dd>
          </div>
        )}
      </dl>

      {order.delays > 0 && active && (
        <p className="text-xs font-medium text-warning">
          Gecikir, qonağa yeni vaxt göndərilib
        </p>
      )}
      {order.status === ORDER_STATUS.rejected && (
        <p className="text-xs text-muted-foreground">
          Səbəb: {REJECT_LABELS[order.rejectReason]}. Qonağın hesabına heç nə
          yazılmayıb.
        </p>
      )}
      {order.status === ORDER_STATUS.delivered && order.feedback.submitted && (
        <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Star
            className="size-3.5 fill-warning text-warning"
            aria-hidden="true"
          />
          Qonaq rəyi: {order.feedback.rating}/5
        </p>
      )}

      {order.status === ORDER_STATUS.sent && (
        <SentActions order={order} dispatch={dispatch} />
      )}
      {active && <ActiveActions order={order} dispatch={dispatch} />}
    </motion.article>
  )
}
