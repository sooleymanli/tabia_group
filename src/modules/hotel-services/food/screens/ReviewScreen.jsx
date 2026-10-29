import { MapPin, WalletCards } from 'lucide-react'
import { useScenarioDispatch, useScenarioState } from '@/demo/scenarioStore'
import { useLocalized, useT } from '@/guest-app/i18n'
import { PrimaryAction } from '@/guest-app/ui/PrimaryAction'
import { ScreenHeader } from '@/guest-app/ui/ScreenHeader'
import { cartTotal, linePrice } from '../foodOrderModel'
import { getLocation, getMenuItem } from '../menuData'
import { LineOptions } from './CartScreen'

export function ReviewScreen() {
  const t = useT()
  const { text, money } = useLocalized()
  const dispatch = useScenarioDispatch()
  const cart = useScenarioState((s) => s.cart)
  const location = getLocation(useScenarioState((s) => s.locationId))
  const via = useScenarioState((s) => s.locationVia)

  return (
    <>
      <ScreenHeader
        title={t('food.review')}
        onBack={() => dispatch({ type: 'back' })}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 pb-4 *:shrink-0">
        {location && (
          <section className="flex items-center gap-3 rounded-2xl bg-card p-2.5 pe-4">
            <img
              src={location.image}
              alt=""
              className="size-14 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5" />
                {t('food.deliverTo')}
              </p>
              <p className="truncate text-sm font-semibold">
                {text(location.name)}
              </p>
            </div>
            {via === 'qr' && (
              <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
                {t('food.viaQr')}
              </span>
            )}
          </section>
        )}

        <section className="rounded-2xl bg-card px-4 py-1">
          <ul className="divide-y divide-border">
            {cart.map((line) => (
              <li
                key={line.lineId}
                className="flex items-start gap-3 py-3 text-sm"
              >
                <span className="w-7 shrink-0 font-semibold text-primary tabular-nums">
                  {line.qty}×
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {text(getMenuItem(line.itemId)?.name)}
                  </span>
                  <LineOptions options={line.options} />
                </span>
                <span className="tabular-nums">{money(linePrice(line))}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3">
          <span className="grid size-9 place-items-center rounded-full bg-primary/15 text-primary">
            <WalletCards className="size-4" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">{t('food.payment')}</p>
            <p className="text-sm font-semibold">{t('food.chargeRoom')}</p>
          </div>
        </section>

        <div className="mt-auto flex items-baseline justify-between px-1 pt-2">
          <span className="text-sm text-muted-foreground">
            {t('common.total')}
          </span>
          <span className="font-heading text-2xl tabular-nums">
            {money(cartTotal(cart))}
          </span>
        </div>
        <p className="px-1 text-xs text-muted-foreground">
          {t('food.demoPrices')}
        </p>
      </div>

      <PrimaryAction
        data-demo-target="place-order"
        onClick={() => dispatch({ type: 'placeOrder' })}
      >
        {t('food.placeOrder')}
      </PrimaryAction>
    </>
  )
}
