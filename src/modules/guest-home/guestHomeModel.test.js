import { describe, expect, it } from 'vitest'
import { DICTIONARIES } from '@/guest-app/i18n'
import {
  HOME_TABS,
  createInitialState,
  reduce,
  viewKey,
} from './guestHomeModel'
import { guestHomeSteps } from './guestHomeSteps'
import {
  NOTES,
  NOTIFICATIONS,
  SERVICES,
  SERVICE_GROUPS,
  VENUES,
} from './homeData'

const run = (actions, state = createInitialState()) =>
  actions.reduce((current, action) => reduce(current, action), state)

describe('guest home model', () => {
  it('starts on the home tab', () => {
    expect(viewKey(createInitialState())).toBe('home')
  })

  it('switches tabs and ignores unknown ones', () => {
    const state = run([{ type: 'selectTab', tab: 'profile' }])
    expect(state.tab).toBe('profile')
    expect(reduce(state, { type: 'selectTab', tab: 'nope' })).toBe(state)
    expect(reduce(state, { type: 'selectTab', tab: 'profile' })).toBe(state)
  })

  it('opens a note, keeps it in the view key and closes it on tab change', () => {
    const open = run([{ type: 'openNote', noteId: 'spa' }])
    expect(viewKey(open)).toBe('home:note:spa')
    expect(reduce(open, { type: 'openNote', noteId: 'nope' })).toBe(open)
    expect(reduce(open, { type: 'closeNote' }).noteId).toBeNull()
    expect(
      reduce(open, { type: 'selectTab', tab: 'services' }).noteId,
    ).toBeNull()
  })

  it('shows the note when the orders or chat tab opens', () => {
    expect(run([{ type: 'selectTab', tab: 'orders' }]).noteId).toBe('orders')
    expect(run([{ type: 'selectTab', tab: 'chat' }]).noteId).toBe('chatTab')
    expect(run([{ type: 'selectTab', tab: 'profile' }]).noteId).toBeNull()
  })

  it('opens notifications as their own view and remembers they were read', () => {
    const open = run([
      { type: 'openNote', noteId: 'spa' },
      { type: 'openNotifications' },
      { type: 'readNotifications' },
    ])
    expect(open.noteId).toBeNull()
    expect(viewKey(open)).toBe('home:notifications')
    const closed = reduce(open, { type: 'closeNotifications' })
    expect(closed.notificationsOpen).toBe(false)
    expect(closed.notificationsRead).toBe(true)
  })

  it('shows all entertainment venues on demand and folds them on tab change', () => {
    const open = run([
      { type: 'selectTab', tab: 'services' },
      { type: 'toggleAllFun' },
    ])
    expect(open.allFunShown).toBe(true)
    expect(reduce(open, { type: 'toggleAllFun' }).allFunShown).toBe(false)
    expect(reduce(open, { type: 'selectTab', tab: 'home' }).allFunShown).toBe(
      false,
    )
  })

  it('autoplay visits every tab and ends where a manual visitor starts', () => {
    const final = run(guestHomeSteps.map((s) => s.action))
    const visited = new Set(
      guestHomeSteps.map((s) => s.action.tab).filter(Boolean),
    )
    expect([...visited].sort()).toEqual([...HOME_TABS].sort())
    expect(final).toEqual(createInitialState())
    expect(new Set(guestHomeSteps.map((s) => s.id)).size).toBe(
      guestHomeSteps.length,
    )
  })

  it('has a translated label for every service, group, note and notification', () => {
    const az = DICTIONARIES.az
    for (const group of SERVICE_GROUPS) {
      expect(az[`services.group.${group}`], group).toBeTruthy()
      expect(SERVICES.some((s) => s.group === group)).toBe(true)
    }
    for (const note of Object.values(NOTES)) {
      expect(note.label ?? az[note.labelKey], note.labelKey).toBeTruthy()
    }
    for (const venue of VENUES) {
      expect(az[venue.metaKey], venue.id).toBeTruthy()
    }
    for (const { id } of NOTIFICATIONS) {
      expect(az[`notif.${id}.title`], id).toBeTruthy()
      expect(az[`notif.${id}.text`], id).toBeTruthy()
    }
  })
})
