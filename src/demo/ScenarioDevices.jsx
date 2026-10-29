import { HotelAdminFrame } from '@/components/hotel-admin/HotelAdminFrame'
import { PhoneFrame } from '@/components/phone/PhoneFrame'
import { ScenarioPlaceholder } from '@/presentation/SlideLayout'
import { DemoTouchIndicator } from './DemoTouchIndicator'
import { ScenarioStoreContext } from './scenarioStore'

// A presenter's own tap inside a device takes over from autoplay (README 6.3).
function ManualTakeover({ player, children, className = 'size-full' }) {
  return (
    <div
      className={className}
      onPointerDownCapture={player.pause}
      onKeyDownCapture={player.pause}
    >
      {children}
    </div>
  )
}

export function ScenarioPhone({ runtime }) {
  const { scenario, store, player } = runtime
  const Screen = scenario?.Phone

  return (
    <ManualTakeover player={player}>
      <PhoneFrame overlay={<DemoTouchIndicator player={player} />}>
        {Screen ? (
          <ScenarioStoreContext value={store}>
            <Screen />
          </ScenarioStoreContext>
        ) : (
          <ScenarioPlaceholder>
            İnteraktiv demo növbəti mərhələlərdə əlavə olunacaq.
          </ScenarioPlaceholder>
        )}
      </PhoneFrame>
    </ManualTakeover>
  )
}

export function ScenarioAdmin({ runtime }) {
  const { scenario, store, player } = runtime
  const Panel = scenario?.Admin

  return (
    <ManualTakeover player={player}>
      <HotelAdminFrame overlay={<DemoTouchIndicator player={player} />}>
        {Panel ? (
          <ScenarioStoreContext value={store}>
            <Panel />
          </ScenarioStoreContext>
        ) : (
          <ScenarioPlaceholder>
            Otel panelinin bu slayd üçün görünüşü hazırlanır.
          </ScenarioPlaceholder>
        )}
      </HotelAdminFrame>
    </ManualTakeover>
  )
}

// Presenter-side controls that act on the same store (e.g. simulated restaurant staff).
export function ScenarioAside({ runtime }) {
  const { scenario, store, player } = runtime
  const Aside = scenario?.Aside
  if (!Aside) return null

  return (
    <ManualTakeover player={player} className="">
      <ScenarioStoreContext value={store}>
        <Aside />
      </ScenarioStoreContext>
    </ManualTakeover>
  )
}
