import { AnimatePresence, motion } from 'motion/react'
import { ShoppingBag, Undo2 } from 'lucide-react'
import { useScenarioDispatch, useScenarioState } from '@/demo/scenarioStore'
import { useLocalized, useT } from '@/guest-app/i18n'
import { AnimatedNumber } from '@/guest-app/ui/AnimatedNumber'
import { PrimaryAction } from '@/guest-app/ui/PrimaryAction'
import { Pressable } from '@/guest-app/ui/Pressable'
import { QuantityStepper } from '@/guest-app/ui/QuantityStepper'
import { ScreenHeader } from '@/guest-app/ui/ScreenHeader'
import { cartCount, cartTotal, linePrice } from '../foodOrderModel'
import { getMenuItem, optionLabel } from '../menuData'

export function LineOptions({ options }) {
  const { text } = useLocalized()
  if (!options.length) return null
  return (
    <span className="block truncate text-xs text-muted-foreground">
      {options.map((id) => text(optionLabel(id))).join(', ')}
    </span>
  )
}

function CartLine({ line }) {
  const dispatch = useScenarioDispatch()
  const { text, money, dir } = useLocalized()
  const item = getMenuItem(line.itemId)
  const side = dir === 'rtl' ? -1 : 1

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 24 * side }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 * side, transition: { duration: 0.2 } }}
      className="flex items-center gap-3 rounded-2xl bg-card p-2.5 pe-3"
    >
      <img
        src={item.image}
        alt=""
        className="size-16 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{text(item.name)}</p>
        <LineOptions options={line.options} />
        <p className="mt-1 text-sm font-semibold text-primary tabular-nums">
          {money(linePrice(line))}
        </p>
      </div>
      <QuantityStepper
        size="sm"
        min={0}
        value={line.qty}
        onChange={(qty) =>
          dispatch({
            type: 'changeLineQty',
            lineId: line.lineId,
            delta: qty - line.qty,
          })
        }
        plusTarget={`line-plus-${line.lineId}`}
        minusTarget={`line-minus-${line.lineId}`}
      />
    </motion.li>
  )
}

export function CartScreen() {
  const t = useT()
  const { text, money } = useLocalized()
  const dispatch = useScenarioDispatch()
  const cart = useScenarioState((s) => s.cart)
  const removed = useScenarioState((s) => s.removed)
  const count = cartCount(cart)

  return (
    <>
      <ScreenHeader
        title={t('food.cart')}
        onBack={() => dispatch({ type: 'back' })}
        trailing={
          count > 0 && (
            <span className="text-sm text-muted-foreground tabular-nums">
              {t('food.count', { n: count })}
            </span>
          )
        }
      />

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 pb-4 *:shrink-0">
        {cart.length === 0 && !removed ? (
          <div className="m-auto flex flex-col items-center gap-3 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-secondary text-muted-foreground">
              <ShoppingBag className="size-7" />
            </span>
            <p className="font-semibold">{t('food.emptyCart')}</p>
            <p className="text-sm text-muted-foreground">
              {t('food.emptyCartHint')}
            </p>
            <Pressable
              onClick={() => dispatch({ type: 'back' })}
              className="mt-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold"
            >
              {t('food.backToMenu')}
            </Pressable>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-2.5">
              <AnimatePresence initial={false} mode="popLayout">
                {cart.map((line) => (
                  <CartLine key={line.lineId} line={line} />
                ))}
              </AnimatePresence>
            </ul>

            <AnimatePresence>
              {removed && (
                <motion.div
                  role="status"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="flex items-center gap-3 rounded-2xl bg-popover px-4 py-3 text-sm"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {t('food.removed', {
                      name: text(getMenuItem(removed.line.itemId)?.name),
                    })}
                  </span>
                  <Pressable
                    onClick={() => dispatch({ type: 'undoRemove' })}
                    className="flex items-center gap-1.5 font-semibold text-primary"
                  >
                    <Undo2 className="size-4" />
                    {t('action.undo')}
                  </Pressable>
                </motion.div>
              )}
            </AnimatePresence>

            {cart.length > 0 && (
              <div className="mt-auto flex flex-col gap-1 rounded-2xl border border-border px-4 py-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t('common.total')}
                  </span>
                  <AnimatedNumber
                    value={cartTotal(cart)}
                    format={money}
                    className="font-heading text-xl tabular-nums"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('food.chargeRoom')}. {t('food.demoPrices')}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {cart.length > 0 && (
        <PrimaryAction
          data-demo-target="to-location"
          onClick={() => dispatch({ type: 'openLocation' })}
        >
          {t('food.chooseLocation')}
        </PrimaryAction>
      )}
    </>
  )
}
