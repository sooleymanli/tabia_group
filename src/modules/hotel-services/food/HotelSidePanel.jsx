import { Badge } from '@/components/ui/badge'
import { BRAND } from '@/config/brand'
import { useScenarioState } from '@/demo/scenarioStore'
import { OrderCard } from '@/modules/hotel-admin/orders/OrderCard'
import { selectActiveOrder } from './foodOrderModel'

// The guest's order as the restaurant sees it on the hotel panel (full queue: slide "hotel-admin").
export function HotelSidePanel() {
  const order = useScenarioState(selectActiveOrder)

  return (
    <section
      aria-label="Restoran paneli"
      className="flex min-h-64 flex-col gap-3 rounded-2xl border bg-card p-4"
    >
      <div className="flex items-center gap-2">
        <h2 className="font-sans text-sm font-semibold text-ink">
          Restoran paneli
        </h2>
        <Badge variant="secondary">{BRAND.demoLabel}</Badge>
      </div>
      {order ? (
        <OrderCard order={order} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Qonaq sifariş göndərəndə restoran onu burada qəbul edir və statusunu
          dəyişir.
        </p>
      )}
    </section>
  )
}
