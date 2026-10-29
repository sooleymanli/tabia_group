import { AnimatePresence, LayoutGroup } from 'motion/react'
import { useScenarioState } from '@/demo/scenarioStore'
import { formatClock } from '@/modules/hotel-services/food/foodOrderModel'
import { boardColumns } from './orderBoard'
import { OrderCard } from './OrderCard'

const EMPTY_TEXT = {
  new: 'Yeni sorğu yoxdur. Qonaq telefonda sifariş verəndə burada görünəcək.',
  active: 'İcrada sorğu yoxdur.',
  closed: 'Bağlanmış sorğu yoxdur.',
}

// Restaurant queue on the hotel panel; reads the same store as the guest phone (group "service-orders").
export function OrdersBoard() {
  const orders = useScenarioState((state) => state.orders)
  const clock = useScenarioState((state) => state.clock)
  const columns = boardColumns(orders)

  return (
    <div className="@container flex min-h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="font-heading text-base font-medium text-ink">
          Xidmət sorğuları
        </h2>
        <p className="text-xs text-muted-foreground">
          Restoran şöbəsi, demo saatı {formatClock(clock)}
        </p>
      </div>

      <LayoutGroup>
        <div className="grid gap-4 @2xl:grid-cols-3">
          {columns.map((column) => (
            <section
              key={column.id}
              aria-label={`${column.title}: ${column.orders.length}`}
              className="flex min-w-0 flex-col gap-2 rounded-xl bg-muted/50 p-2"
            >
              <h3 className="flex items-center gap-2 px-1 pt-1 text-xs font-semibold text-muted-foreground">
                {column.title}
                <span className="rounded-full bg-background px-1.5 tabular-nums">
                  {column.orders.length}
                </span>
              </h3>
              <AnimatePresence initial={false}>
                {column.orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </AnimatePresence>
              {column.orders.length === 0 && (
                <p className="px-1 py-3 text-xs text-muted-foreground">
                  {EMPTY_TEXT[column.id]}
                </p>
              )}
            </section>
          ))}
        </div>
      </LayoutGroup>
    </div>
  )
}
