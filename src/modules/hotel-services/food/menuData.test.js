import { describe, expect, it } from 'vitest'
import { DICTIONARIES } from '@/guest-app/i18n'
import { CATEGORIES, LOCATIONS, MENU, optionLabel } from './menuData'

describe('food menu data', () => {
  it('points every visible text at an existing dictionary key', () => {
    const texts = [
      ...CATEGORIES.map((c) => c.name),
      ...MENU.flatMap((item) => [
        item.name,
        item.description,
        ...item.options.map(optionLabel),
      ]),
      ...LOCATIONS.flatMap((location) => [location.name, location.hint]),
    ]
    for (const text of texts) {
      expect(DICTIONARIES.az[text.key], text.key).toBeTruthy()
    }
  })

  it('keeps a recorded Unsplash source for every local photo', () => {
    for (const entry of [...MENU, ...LOCATIONS]) {
      expect(entry.image).toMatch(/^\/assets\/demo\//)
      if (entry.source !== 'client')
        expect(entry.photoId).toMatch(/^[\w-]{11}$/)
    }
  })
})
