import { describe, expect, it } from 'vitest'
import {
  DICTIONARIES,
  LOCALES,
  formatMoney,
  getLocale,
  pickText,
  translate,
} from './index'

describe('guest app i18n', () => {
  it('has the same keys in every one of the 15 languages', () => {
    const keys = Object.keys(DICTIONARIES.az).sort()
    expect(LOCALES).toHaveLength(15)
    for (const { id } of LOCALES) {
      expect(Object.keys(DICTIONARIES[id]).sort(), id).toEqual(keys)
    }
  })

  it('keeps every placeholder in every translation', () => {
    const placeholders = (text) => (text.match(/\{\w+\}/g) ?? []).sort()
    for (const { id } of LOCALES) {
      for (const [key, text] of Object.entries(DICTIONARIES.en)) {
        expect(placeholders(DICTIONARIES[id][key]), `${id} ${key}`).toEqual(
          placeholders(text),
        )
      }
    }
  })

  it('marks right-to-left languages', () => {
    const rtl = LOCALES.filter((item) => item.dir === 'rtl').map((l) => l.id)
    expect(rtl.sort()).toEqual(['ar', 'fa', 'he', 'ur'])
  })

  it('formats money the same way in every browser', () => {
    expect(formatMoney(12.5, 'az')).toBe('12,50\u00a0₼')
    expect(formatMoney(1234.5, 'en')).toBe('1\u00a0234.50\u00a0₼')
    expect(formatMoney(0, 'ru')).toBe('0,00\u00a0₼')
  })

  it('falls back to English, then Azerbaijani, then the key', () => {
    expect(translate('en', 'tab.home')).toBe('Home')
    expect(translate('xx', 'tab.home')).toBe('Home')
    expect(translate('en', 'missing.key')).toBe('missing.key')
    expect(translate('ru', 'common.room', { room: 412 })).toBe('Номер 412')
    expect(getLocale('xx').id).toBe('az')
  })

  it('resolves dictionary references and localized maps in demo data', () => {
    expect(pickText({ key: 'menu.pizza.name' }, 'tr')).toBe('Margarita pizza')
    expect(pickText({ az: 'Çay', en: 'Tea' }, 'zh')).toBe('Tea')
    expect(pickText('412', 'en')).toBe('412')
  })
})
