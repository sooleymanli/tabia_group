import { Check, Moon, Settings, Sun } from 'lucide-react'
import { LOCALES, useGuestLocale, useT } from '@/guest-app/i18n'
import { cn } from '@/lib/utils'
import { BottomSheet } from './BottomSheet'
import { Pressable } from './Pressable'

const THEME_OPTIONS = [
  { id: 'light', icon: Sun },
  { id: 'dark', icon: Moon },
]

export function SettingsButton({ className }) {
  const t = useT()
  const openSettings = useGuestLocale((state) => state.openSettings)

  return (
    <Pressable
      onClick={openSettings}
      aria-label={t('settings.open')}
      data-demo-target="open-settings"
      className={cn(
        'grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground',
        className,
      )}
    >
      <Settings className="size-[18px]" />
    </Pressable>
  )
}

function ThemePicker() {
  const t = useT()
  const theme = useGuestLocale((state) => state.theme)
  const setTheme = useGuestLocale((state) => state.setTheme)

  return (
    <div
      role="radiogroup"
      aria-label={t('settings.appearance')}
      className="grid grid-cols-2 gap-2"
    >
      {THEME_OPTIONS.map(({ id, icon: Icon }) => {
        const active = theme === id
        return (
          <Pressable
            key={id}
            role="radio"
            aria-checked={active}
            data-demo-target={`theme-${id}`}
            onClick={() => setTheme(id)}
            className={cn(
              'flex h-14 items-center justify-center gap-2 rounded-2xl text-sm font-semibold ring-1 transition-colors',
              active
                ? 'bg-primary text-primary-foreground ring-primary'
                : 'bg-card text-foreground ring-border',
            )}
          >
            <Icon className="size-4" />
            {t(`settings.theme.${id}`)}
          </Pressable>
        )
      })}
    </div>
  )
}

function LanguageList() {
  const t = useT()
  const locale = useGuestLocale((state) => state.locale)
  const setLocale = useGuestLocale((state) => state.setLocale)

  return (
    <div
      role="radiogroup"
      aria-label={t('language.label')}
      className="overflow-hidden rounded-2xl bg-card ring-1 ring-border"
    >
      {LOCALES.map((item) => {
        const active = item.id === locale
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={active}
            data-demo-target={`locale-${item.id}`}
            onClick={() => setLocale(item.id)}
            className="flex h-12 w-full items-center gap-3 border-b border-border px-4 text-start text-[15px] outline-none last:border-b-0 focus-visible:bg-secondary active:bg-secondary"
          >
            {/* <bdi> keeps each name's own direction while rows align with the app's. */}
            <span
              className={cn('flex-1 text-start', active && 'font-semibold')}
            >
              <bdi lang={item.id}>{item.name}</bdi>
            </span>
            {active && <Check className="size-4 text-primary" />}
          </button>
        )
      })}
    </div>
  )
}

// One sheet per phone; the choice is global, so every slide's phone follows it.
export function SettingsSheet() {
  const t = useT()
  const open = useGuestLocale((state) => state.settingsOpen)
  const closeSettings = useGuestLocale((state) => state.closeSettings)

  return (
    <BottomSheet
      open={open}
      onClose={closeSettings}
      title={t('settings.title')}
    >
      <div className="flex flex-col gap-5">
        <section className="flex flex-col gap-2">
          <h3 className="font-sans text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {t('settings.appearance')}
          </h3>
          <ThemePicker />
        </section>
        <section className="flex flex-col gap-2">
          <h3 className="font-sans text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {t('language.label')}
          </h3>
          <LanguageList />
        </section>
      </div>
    </BottomSheet>
  )
}
