import { useCallback } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import ar from './ar'
import az from './az'
import de from './de'
import en from './en'
import fa from './fa'
import fr from './fr'
import he from './he'
import hi from './hi'
import ka from './ka'
import kk from './kk'
import ru from './ru'
import tr from './tr'
import ur from './ur'
import uz from './uz'
import zh from './zh'

// Ordered by relevance: local languages first, then main tourist markets for Azerbaijan.
export const LOCALES = [
  { id: 'az', name: 'Azərbaycanca', dir: 'ltr', decimal: ',' },
  { id: 'en', name: 'English', dir: 'ltr', decimal: '.' },
  { id: 'ru', name: 'Русский', dir: 'ltr', decimal: ',' },
  { id: 'tr', name: 'Türkçe', dir: 'ltr', decimal: ',' },
  { id: 'fa', name: 'فارسی', dir: 'rtl', decimal: '.' },
  { id: 'ka', name: 'ქართული', dir: 'ltr', decimal: ',' },
  { id: 'kk', name: 'Қазақша', dir: 'ltr', decimal: ',' },
  { id: 'he', name: 'עברית', dir: 'rtl', decimal: '.' },
  { id: 'ur', name: 'اردو', dir: 'rtl', decimal: '.' },
  { id: 'uz', name: 'Oʻzbekcha', dir: 'ltr', decimal: ',' },
  { id: 'zh', name: '中文', dir: 'ltr', decimal: '.' },
  { id: 'hi', name: 'हिन्दी', dir: 'ltr', decimal: '.' },
  { id: 'ar', name: 'العربية', dir: 'rtl', decimal: '.' },
  { id: 'de', name: 'Deutsch', dir: 'ltr', decimal: ',' },
  { id: 'fr', name: 'Français', dir: 'ltr', decimal: ',' },
]

export const DICTIONARIES = {
  az,
  en,
  ru,
  tr,
  fa,
  ka,
  kk,
  he,
  ur,
  uz,
  zh,
  hi,
  ar,
  de,
  fr,
}
export const THEMES = ['light', 'dark']
const DEFAULT_LOCALE = 'az'
const DEFAULT_THEME = 'light'
// Guests who pick a language we lack read English rather than Azerbaijani.
const FALLBACK_CHAIN = ['en', DEFAULT_LOCALE]

export const getLocale = (id) =>
  LOCALES.find((item) => item.id === id) ?? LOCALES[0]

// Guest app preferences: shared by every slide and kept outside demo stores, so a demo
// reset never changes them. Persisted so a reload keeps the presenter's choice.
export const useGuestLocale = create(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      theme: DEFAULT_THEME,
      settingsOpen: false,
      setLocale: (locale) =>
        set({ locale: DICTIONARIES[locale] ? locale : DEFAULT_LOCALE }),
      setTheme: (theme) =>
        set({ theme: THEMES.includes(theme) ? theme : DEFAULT_THEME }),
      openSettings: () => set({ settingsOpen: true }),
      closeSettings: () => set({ settingsOpen: false }),
    }),
    {
      name: 'tabia-guest:app-prefs',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ locale, theme }) => ({ locale, theme }),
    },
  ),
)

export function translate(locale, key, vars) {
  let template = DICTIONARIES[locale]?.[key]
  for (const fallback of FALLBACK_CHAIN) {
    template ??= DICTIONARIES[fallback][key]
  }
  template ??= key
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in vars ? String(vars[name]) : match,
  )
}

// Demo data stores text as a dictionary reference `{ key }`, a `{ az, en, ... }` map or a
// language-neutral string.
export function pickText(value, locale) {
  if (value == null || typeof value === 'string') return value ?? ''
  if (value.key) return translate(locale, value.key)
  return value[locale] ?? value.en ?? value[DEFAULT_LOCALE] ?? ''
}

// Built by hand: some browsers ship without az ICU data and would silently switch separators.
export function formatMoney(amount, locale) {
  const decimal = getLocale(locale).decimal
  const [whole, cents] = Math.abs(amount).toFixed(2).split('.')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
  return `${amount < 0 ? '−' : ''}${grouped}${decimal}${cents}\u00a0₼`
}

export function useT() {
  const locale = useGuestLocale((state) => state.locale)
  return useCallback((key, vars) => translate(locale, key, vars), [locale])
}

export function useLocalized() {
  const locale = useGuestLocale((state) => state.locale)
  return {
    locale,
    dir: getLocale(locale).dir,
    text: (value) => pickText(value, locale),
    money: (amount) => formatMoney(amount, locale),
  }
}
