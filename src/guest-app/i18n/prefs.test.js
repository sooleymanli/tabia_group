import { afterEach, describe, expect, it, vi } from 'vitest'

function memoryStorage() {
  const data = new Map()
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  }
}

async function freshStore() {
  vi.resetModules()
  return (await import('./index')).useGuestLocale
}

describe('guest app preferences', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('defaults to Azerbaijani and the light theme', async () => {
    vi.stubGlobal('localStorage', memoryStorage())
    const store = await freshStore()
    expect(store.getState()).toMatchObject({ locale: 'az', theme: 'light' })
  })

  it('keeps language and theme after a reload, but not the open sheet', async () => {
    vi.stubGlobal('localStorage', memoryStorage())
    const first = await freshStore()
    first.getState().setLocale('ar')
    first.getState().setTheme('dark')
    first.getState().openSettings()

    const second = await freshStore()
    expect(second.getState()).toMatchObject({
      locale: 'ar',
      theme: 'dark',
      settingsOpen: false,
    })
  })

  it('rejects unknown values', async () => {
    vi.stubGlobal('localStorage', memoryStorage())
    const store = await freshStore()
    store.getState().setLocale('xx')
    store.getState().setTheme('sepia')
    expect(store.getState()).toMatchObject({ locale: 'az', theme: 'light' })
  })
})
