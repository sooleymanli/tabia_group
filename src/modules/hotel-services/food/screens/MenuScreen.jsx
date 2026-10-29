import { useId } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { Clock3, MapPin, Plus } from 'lucide-react'
import { useScenarioDispatch, useScenarioState } from '@/demo/scenarioStore'
import { useLocalized, useT } from '@/guest-app/i18n'
import { SettingsButton } from '@/guest-app/ui/GuestSettings'
import { Pressable } from '@/guest-app/ui/Pressable'
import { cn } from '@/lib/utils'
import { CATEGORIES, MENU, getLocation } from '../menuData'

function CategoryChips() {
  const dispatch = useScenarioDispatch()
  const categoryId = useScenarioState((s) => s.categoryId)
  const { text } = useLocalized()
  const groupId = useId()

  return (
    <LayoutGroup id={groupId}>
      <div className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1">
        {CATEGORIES.map((category) => {
          const active = category.id === categoryId
          return (
            <Pressable
              key={category.id}
              data-demo-target={`category-${category.id}`}
              aria-pressed={active}
              onClick={() =>
                dispatch({ type: 'selectCategory', categoryId: category.id })
              }
              className={cn(
                'relative isolate shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                active
                  ? 'text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground',
              )}
            >
              {active && (
                <motion.span
                  layoutId="category-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                />
              )}
              {text(category.name)}
            </Pressable>
          )
        })}
      </div>
    </LayoutGroup>
  )
}

function MenuCard({ item }) {
  const dispatch = useScenarioDispatch()
  const t = useT()
  const { text, money } = useLocalized()
  const name = text(item.name)

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="relative"
    >
      <Pressable
        data-demo-target={`menu-item-${item.id}`}
        onClick={() => dispatch({ type: 'openItem', itemId: item.id })}
        className="flex w-full flex-col overflow-hidden rounded-3xl bg-card text-start"
      >
        <img
          src={item.image}
          alt=""
          loading="lazy"
          className="aspect-[5/4] w-full object-cover"
        />
        <span className="flex flex-col gap-1.5 p-3 pb-3.5">
          <span className="line-clamp-2 min-h-10 text-sm leading-5 font-semibold">
            {name}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock3 className="size-3.5" />
            {t('food.minutes', { n: item.prepMinutes })}
          </span>
          <span className="text-[15px] font-semibold text-primary tabular-nums">
            {money(item.price)}
          </span>
        </span>
      </Pressable>
      <Pressable
        aria-label={t('food.quickAdd', { name })}
        onClick={() => dispatch({ type: 'quickAdd', itemId: item.id })}
        className="absolute end-2.5 bottom-3 grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-black/30"
      >
        <Plus className="size-4" strokeWidth={2.5} />
      </Pressable>
    </motion.li>
  )
}

export function MenuScreen() {
  const t = useT()
  const { text } = useLocalized()
  const categoryId = useScenarioState((s) => s.categoryId)
  const locationId = useScenarioState((s) => s.locationId)
  const location = getLocation(locationId)
  const items =
    categoryId === 'all'
      ? MENU
      : MENU.filter((item) => item.categoryId === categoryId)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 pt-1 pb-28 *:shrink-0">
      <header className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">
            {t('food.title')}
          </p>
          <h2 className="font-heading text-xl leading-tight">
            {t('food.subtitle')}
          </h2>
        </div>
        <SettingsButton className="mt-1" />
      </header>

      <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3">
        <span className="grid size-9 place-items-center rounded-full bg-primary/15 text-primary">
          <MapPin className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{t('food.deliverTo')}</p>
          <p className="truncate text-sm font-semibold">
            {location ? text(location.name) : t('food.noLocation')}
          </p>
        </div>
      </div>

      <CategoryChips />

      <ul className="grid grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
