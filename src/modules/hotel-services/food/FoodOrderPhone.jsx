import { AnimatePresence, motion } from 'motion/react'
import { ShoppingBag } from 'lucide-react'
import { useScenarioDispatch, useScenarioState } from '@/demo/scenarioStore'
import { useLocalized, useT } from '@/guest-app/i18n'
import { AnimatedNumber } from '@/guest-app/ui/AnimatedNumber'
import { Pressable } from '@/guest-app/ui/Pressable'
import { ScreenTransition } from '@/guest-app/ui/ScreenTransition'
import { SCREENS, cartCount, cartTotal } from './foodOrderModel'
import { CartScreen } from './screens/CartScreen'
import { ItemScreen } from './screens/ItemScreen'
import { LocationScreen } from './screens/LocationScreen'
import { MenuScreen } from './screens/MenuScreen'
import { ReviewScreen } from './screens/ReviewScreen'
import { TrackingScreen } from './screens/TrackingScreen'

const SCREEN_COMPONENTS = {
  [SCREENS.menu]: MenuScreen,
  [SCREENS.item]: ItemScreen,
  [SCREENS.cart]: CartScreen,
  [SCREENS.location]: LocationScreen,
  [SCREENS.review]: ReviewScreen,
  [SCREENS.tracking]: TrackingScreen,
}

function CartBar() {
  const t = useT()
  const { money } = useLocalized()
  const dispatch = useScenarioDispatch()
  const cart = useScenarioState((s) => s.cart)
  const count = cartCount(cart)

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          className="absolute inset-x-4 bottom-3 z-20"
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        >
          <Pressable
            data-demo-target="cart-bar"
            onClick={() => dispatch({ type: 'openCart' })}
            className="flex h-14 w-full items-center gap-3 rounded-2xl bg-primary px-4 font-semibold text-primary-foreground shadow-[0_12px_32px_-8px_var(--glow)]"
          >
            <motion.span
              key={count}
              initial={{ scale: 1.35 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 600, damping: 14 }}
              className="relative"
            >
              <ShoppingBag className="size-5" />
              <span className="absolute -end-2.5 -top-2 grid min-w-5 place-items-center rounded-full bg-primary-foreground px-1 text-[11px] leading-5 text-primary tabular-nums">
                {count}
              </span>
            </motion.span>
            <span className="ms-2 flex-1 text-start">{t('food.viewCart')}</span>
            <AnimatedNumber
              value={cartTotal(cart)}
              format={money}
              className="tabular-nums"
            />
          </Pressable>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function FoodOrderPhone() {
  const screen = useScenarioState((s) => s.screen)
  const direction = useScenarioState((s) => s.direction)
  const Screen = SCREEN_COMPONENTS[screen]

  return (
    <div className="relative h-full">
      <ScreenTransition screenKey={screen} direction={direction}>
        <Screen />
      </ScreenTransition>
      {screen === SCREENS.menu && <CartBar />}
    </div>
  )
}
