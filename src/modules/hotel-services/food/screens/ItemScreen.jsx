import { motion } from 'motion/react'
import { Check, ChevronLeft, Clock3 } from 'lucide-react'
import { useScenarioDispatch, useScenarioState } from '@/demo/scenarioStore'
import { useLocalized, useT } from '@/guest-app/i18n'
import { AnimatedNumber } from '@/guest-app/ui/AnimatedNumber'
import { PrimaryAction } from '@/guest-app/ui/PrimaryAction'
import { Pressable } from '@/guest-app/ui/Pressable'
import { QuantityStepper } from '@/guest-app/ui/QuantityStepper'
import { cn } from '@/lib/utils'
import { getMenuItem, optionLabel } from '../menuData'

export function ItemScreen() {
  const t = useT()
  const { text, money } = useLocalized()
  const dispatch = useScenarioDispatch()
  const item = getMenuItem(useScenarioState((s) => s.itemId))
  const draft = useScenarioState((s) => s.draft)
  if (!item) return null

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
        <div className="relative">
          <motion.img
            src={item.image}
            alt=""
            className="aspect-[4/3] w-full object-cover"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
          <Pressable
            data-demo-target="back"
            aria-label={t('action.back')}
            onClick={() => dispatch({ type: 'back' })}
            className="absolute start-3 top-2 grid size-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md"
          >
            <ChevronLeft className="size-5 rtl:-scale-x-100" />
          </Pressable>
        </div>

        <div className="-mt-6 flex flex-col gap-5 px-5">
          <div className="relative flex flex-col gap-2">
            <h2 className="font-heading text-2xl leading-tight">
              {text(item.name)}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {text(item.description)}
            </p>
            <p className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-primary tabular-nums">
                {money(item.price)}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock3 className="size-4" />
                {t('food.minutes', { n: item.prepMinutes })}
              </span>
            </p>
          </div>

          {item.options.length > 0 && (
            <section className="flex flex-col gap-2.5">
              <h3 className="text-sm font-semibold">{t('food.options')}</h3>
              <div className="flex flex-wrap gap-2">
                {item.options.map((optionId) => {
                  const selected = draft.options.includes(optionId)
                  return (
                    <Pressable
                      key={optionId}
                      data-demo-target={`option-${optionId}`}
                      aria-pressed={selected}
                      onClick={() =>
                        dispatch({ type: 'toggleOption', optionId })
                      }
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-colors',
                        selected
                          ? 'border-primary bg-primary/15 text-primary'
                          : 'border-border bg-card text-foreground',
                      )}
                    >
                      <motion.span
                        initial={false}
                        animate={{
                          width: selected ? 16 : 0,
                          opacity: selected ? 1 : 0,
                        }}
                        className="flex overflow-hidden"
                      >
                        <Check className="size-4 shrink-0" />
                      </motion.span>
                      {text(optionLabel(optionId))}
                    </Pressable>
                  )
                })}
              </div>
            </section>
          )}

          <section className="flex items-center justify-between rounded-2xl bg-card px-4 py-3">
            <h3 className="text-sm font-semibold">{t('food.quantity')}</h3>
            <QuantityStepper
              value={draft.qty}
              onChange={(qty) => dispatch({ type: 'setDraftQty', qty })}
              plusTarget="qty-plus"
              minusTarget="qty-minus"
            />
          </section>
        </div>
      </div>

      <PrimaryAction
        data-demo-target="add-to-cart"
        onClick={() => dispatch({ type: 'addToCart' })}
      >
        <span className="flex-1 text-start">{t('food.addToCart')}</span>
        <AnimatedNumber
          value={item.price * draft.qty}
          format={money}
          className="tabular-nums"
        />
      </PrimaryAction>
    </>
  )
}
