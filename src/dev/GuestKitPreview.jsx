import { useState } from 'react'
import {
  ChevronLeft,
  ConciergeBell,
  House,
  MessageCircle,
  ReceiptText,
  ShoppingBag,
  UserRound,
} from 'lucide-react'
import { TabiaMark } from '@/components/brand/TabiaLogo'
import { DemoControls } from '@/demo/DemoControls'
import { createDemoSession } from '@/demo/demoSession'
import { ScenarioPhone } from '@/demo/ScenarioDevices'
import { useScenarioDispatch, useScenarioState } from '@/demo/scenarioStore'
import { useScenarioRuntime } from '@/demo/useScenarioRuntime'
import { formatMoney, pickText, useGuestLocale, useT } from '@/guest-app/i18n'
import { AnimatedNumber } from '@/guest-app/ui/AnimatedNumber'
import { BottomSheet } from '@/guest-app/ui/BottomSheet'
import { SettingsButton } from '@/guest-app/ui/GuestSettings'
import { Pressable } from '@/guest-app/ui/Pressable'
import { ScreenTransition } from '@/guest-app/ui/ScreenTransition'
import { TabBar } from '@/guest-app/ui/TabBar'
import {
  SAMPLE_ITEMS,
  sampleCartTotal,
  sampleModel,
  sampleSteps,
} from './sampleModel'

const TABS = [
  { id: 'home', icon: House, labelKey: 'tab.home' },
  { id: 'services', icon: ConciergeBell, labelKey: 'tab.services' },
  { id: 'orders', icon: ReceiptText, labelKey: 'tab.orders' },
  { id: 'chat', icon: MessageCircle, labelKey: 'tab.chat' },
  { id: 'profile', icon: UserRound, labelKey: 'tab.profile' },
]

function SamplePhone() {
  const t = useT()
  const locale = useGuestLocale((s) => s.locale)
  const dispatch = useScenarioDispatch()
  const state = useScenarioState((s) => s)
  const count = Object.values(state.cart).reduce((a, b) => a + b, 0)
  const item = SAMPLE_ITEMS.find((entry) => entry.id === state.itemId)
  const money = (n) => formatMoney(n, locale)

  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1">
        <ScreenTransition screenKey={state.screen} direction={state.direction}>
          {state.screen === 'home' ? (
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pt-2 pb-5">
              <header className="flex items-center gap-2 pb-2">
                <TabiaMark className="size-6 text-primary" label={null} />
                <span className="font-heading text-sm">{t('app.name')}</span>
                <SettingsButton className="ms-auto" />
              </header>
              <p className="text-sm text-muted-foreground">
                {t('common.room', { room: 412 })}
              </p>
              {SAMPLE_ITEMS.map((entry) => (
                <Pressable
                  key={entry.id}
                  data-demo-target={`item-${entry.id}`}
                  onClick={() =>
                    dispatch({ type: 'openItem', itemId: entry.id })
                  }
                  className="flex items-center justify-between rounded-2xl bg-card p-4 text-left"
                >
                  <span className="font-medium">
                    {pickText(entry.name, locale)}
                  </span>
                  <span className="text-primary tabular-nums">
                    {money(entry.price)}
                  </span>
                </Pressable>
              ))}
              <Pressable
                data-demo-target="cart"
                onClick={() => dispatch({ type: 'sheet', open: true })}
                className="mt-auto flex items-center gap-3 rounded-2xl bg-primary px-5 py-4 font-semibold text-primary-foreground"
              >
                <ShoppingBag className="size-5" />
                <span className="tabular-nums">{count}</span>
                <AnimatedNumber
                  value={sampleCartTotal(state.cart)}
                  format={money}
                  className="ml-auto tabular-nums"
                />
              </Pressable>
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-5 px-5 pt-2">
              <Pressable
                data-demo-target="back"
                onClick={() => dispatch({ type: 'back' })}
                className="flex w-fit items-center gap-1 rounded-full bg-secondary py-2 pr-4 pl-2.5 text-sm"
              >
                <ChevronLeft className="size-4" />
                {t('action.back')}
              </Pressable>
              <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-accent to-secondary" />
              <h2 className="font-heading text-2xl">
                {pickText(item?.name, locale)}
              </h2>
              <Pressable
                data-demo-target="add"
                onClick={() => dispatch({ type: 'add', itemId: item.id })}
                className="mt-auto mb-6 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground"
              >
                {t('action.add')}, {money(item?.price ?? 0)}
              </Pressable>
            </div>
          )}
        </ScreenTransition>
        <BottomSheet
          open={state.sheetOpen}
          onClose={() => dispatch({ type: 'sheet', open: false })}
          title={t('common.total')}
        >
          {SAMPLE_ITEMS.filter((entry) => state.cart[entry.id]).map((entry) => (
            <div
              key={entry.id}
              className="flex justify-between border-b border-border py-3"
            >
              <span>
                {pickText(entry.name, locale)} × {state.cart[entry.id]}
              </span>
              <span className="tabular-nums">
                {money(entry.price * state.cart[entry.id])}
              </span>
            </div>
          ))}
        </BottomSheet>
      </div>
      <TabBar
        items={TABS.map((tab) =>
          tab.id === 'orders' ? { ...tab, badge: count } : tab,
        )}
        value={state.tab}
        onChange={(tab) => dispatch({ type: 'tab', tab })}
      />
    </div>
  )
}

const SAMPLE_SCENARIO = {
  id: 'dev-sample',
  model: sampleModel,
  steps: sampleSteps,
  Phone: SamplePhone,
}

export function GuestKitPreview() {
  const [session] = useState(createDemoSession)
  const runtime = useScenarioRuntime(session, SAMPLE_SCENARIO)

  return (
    <div className="grid h-svh grid-rows-[minmax(0,1fr)_auto] bg-background">
      <title>Guest kit (dev)</title>
      <div className="min-h-0 p-6">
        <ScenarioPhone runtime={runtime} />
      </div>
      <footer className="flex justify-center border-t p-3">
        <DemoControls runtime={runtime} />
      </footer>
    </div>
  )
}
