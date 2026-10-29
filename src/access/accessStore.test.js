import { describe, expect, it, vi } from 'vitest'
import { PresentationApiError } from '@/lib/supabase/presentationApi'
import { ACCESS, NOTICE, createAccessStore } from './accessStore'

const anon = { id: 'anon-1', is_anonymous: true }
const staff = { id: 'staff-1', is_anonymous: false }
const serverSession = {
  session_id: 's1',
  visibility: 'vendor',
  expires_at: '2026-11-20T00:00:00Z',
}

function fakeApi(overrides = {}) {
  return {
    isConfigured: true,
    getCurrentUser: vi.fn(async () => null),
    isAdmin: vi.fn(async () => false),
    redeemPin: vi.fn(async () => ({ ok: true, ...serverSession })),
    getMySession: vi.fn(async () => null),
    setFeedbackVisibility: vi.fn(async (v) => v),
    endMySession: vi.fn(async () => null),
    signInWithPassword: vi.fn(async () => staff),
    signOut: vi.fn(async () => {}),
    ...overrides,
  }
}

const failWith = (code) => async () => {
  throw new PresentationApiError(code)
}

describe('access check', () => {
  it('fails closed when Supabase is not configured', async () => {
    const store = createAccessStore(fakeApi({ isConfigured: false }))
    await store.getState().check()
    expect(store.getState().status).toBe(ACCESS.unavailable)
  })

  it('asks for a PIN when there is no auth user', async () => {
    const store = createAccessStore(fakeApi())
    await store.getState().check()
    expect(store.getState().status).toBe(ACCESS.locked)
  })

  it('restores a viewer whose PIN session is still valid on the server', async () => {
    const api = fakeApi({
      getCurrentUser: vi.fn(async () => anon),
      getMySession: vi.fn(async () => serverSession),
    })
    const store = createAccessStore(api)
    await store.getState().check()
    expect(store.getState()).toMatchObject({
      status: ACCESS.viewer,
      session: { visibility: 'vendor', expiresAt: serverSession.expires_at },
    })
    expect(api.isAdmin).not.toHaveBeenCalled()
  })

  it('locks an anonymous user whose session was revoked or expired', async () => {
    const store = createAccessStore(
      fakeApi({ getCurrentUser: vi.fn(async () => anon) }),
    )
    await store.getState().check()
    expect(store.getState().status).toBe(ACCESS.locked)
  })

  it('bypasses the PIN only for a signed-in user the server lists as admin', async () => {
    const admin = createAccessStore(
      fakeApi({
        getCurrentUser: vi.fn(async () => staff),
        isAdmin: vi.fn(async () => true),
      }),
    )
    await admin.getState().check()
    expect(admin.getState().status).toBe(ACCESS.admin)

    const notAdmin = createAccessStore(
      fakeApi({ getCurrentUser: vi.fn(async () => staff) }),
    )
    await notAdmin.getState().check()
    expect(notAdmin.getState().status).toBe(ACCESS.locked)
  })

  it('reports a network failure instead of granting access', async () => {
    const store = createAccessStore(
      fakeApi({ getCurrentUser: failWith('network') }),
    )
    await store.getState().check()
    expect(store.getState().status).toBe(ACCESS.error)
  })

  it('ignores a stale check that resolves after a newer one', async () => {
    let resolveFirst
    const getCurrentUser = vi
      .fn()
      .mockImplementationOnce(
        () => new Promise((resolve) => (resolveFirst = resolve)),
      )
      .mockResolvedValueOnce(anon)
    const store = createAccessStore(
      fakeApi({
        getCurrentUser,
        getMySession: vi.fn(async () => serverSession),
      }),
    )
    const first = store.getState().check()
    await store.getState().check()
    resolveFirst(null)
    await first
    expect(store.getState().status).toBe(ACCESS.viewer)
  })
})

describe('PIN entry', () => {
  it('redeems with vendor visibility and then asks for the choice', async () => {
    const api = fakeApi()
    const store = createAccessStore(api)
    expect(await store.getState().submitPin('1234')).toBeNull()
    expect(api.redeemPin).toHaveBeenCalledWith('1234', 'vendor')
    expect(store.getState().status).toBe(ACCESS.chooseVisibility)
  })

  it.each(['invalid_pin', 'too_many_attempts', 'temporarily_locked'])(
    'returns %s and stays locked',
    async (code) => {
      const store = createAccessStore(fakeApi({ redeemPin: failWith(code) }))
      await store.getState().check()
      expect(await store.getState().submitPin('0000')).toBe(code)
      expect(store.getState().status).toBe(ACCESS.locked)
    },
  )

  it('keeps vendor visibility without an extra request', async () => {
    const api = fakeApi()
    const store = createAccessStore(api)
    await store.getState().submitPin('1234')
    await store.getState().chooseVisibility('vendor')
    expect(api.setFeedbackVisibility).not.toHaveBeenCalled()
    expect(store.getState().session.visibility).toBe('vendor')
    expect(store.getState().status).toBe(ACCESS.viewer)
  })

  it('stores public visibility on the server before entering', async () => {
    const api = fakeApi()
    const store = createAccessStore(api)
    await store.getState().submitPin('1234')
    await store.getState().chooseVisibility('public')
    expect(api.setFeedbackVisibility).toHaveBeenCalledWith('public')
    expect(store.getState().session.visibility).toBe('public')
  })

  it('does not enter when saving public visibility fails', async () => {
    const store = createAccessStore(
      fakeApi({ setFeedbackVisibility: failWith('network') }),
    )
    await store.getState().submitPin('1234')
    expect(await store.getState().chooseVisibility('public')).toBe('network')
    expect(store.getState().status).toBe(ACCESS.chooseVisibility)
  })
})

describe('session lifetime', () => {
  async function viewerStore(overrides) {
    const api = fakeApi({
      getCurrentUser: vi.fn(async () => anon),
      getMySession: vi.fn(async () => serverSession),
      ...overrides,
    })
    const store = createAccessStore(api)
    await store.getState().check()
    return { api, store }
  }

  it('locks with a notice once the server no longer returns the session', async () => {
    const { api, store } = await viewerStore()
    api.getMySession.mockResolvedValueOnce(null)
    await store.getState().revalidate()
    expect(store.getState()).toMatchObject({
      status: ACCESS.locked,
      notice: NOTICE.ended,
      session: null,
    })
  })

  it('keeps the viewer on a transient network error', async () => {
    const { api, store } = await viewerStore()
    api.getMySession.mockRejectedValueOnce(new PresentationApiError('network'))
    await store.getState().revalidate()
    expect(store.getState().status).toBe(ACCESS.viewer)
  })

  it('ends the server session and signs out even if ending fails', async () => {
    const { api, store } = await viewerStore({
      endMySession: failWith('network'),
    })
    await store.getState().signOut()
    expect(api.signOut).toHaveBeenCalled()
    expect(store.getState()).toMatchObject({
      status: ACCESS.locked,
      notice: NOTICE.signedOut,
    })
  })

  it('forgets the remembered reviewer name on sign-out', async () => {
    const clearLocalData = vi.fn()
    const { store } = await viewerStore({ clearLocalData })
    await store.getState().signOut()
    expect(clearLocalData).toHaveBeenCalled()
  })

  it('changes visibility only after the server accepts it', async () => {
    const { api, store } = await viewerStore()
    expect(await store.getState().updateVisibility('public')).toBeNull()
    expect(store.getState().session.visibility).toBe('public')

    api.setFeedbackVisibility.mockRejectedValueOnce(
      new PresentationApiError('network'),
    )
    expect(await store.getState().updateVisibility('vendor')).toBe('network')
    expect(store.getState().session.visibility).toBe('public')
  })

  it('re-checks access when an API call reports no session', async () => {
    const { api, store } = await viewerStore()
    api.getMySession.mockResolvedValueOnce(null)
    store.getState().handleApiError(new PresentationApiError('no_session'))
    await vi.waitFor(() => expect(store.getState().status).toBe(ACCESS.locked))
  })
})

describe('admin sign-in', () => {
  it('rejects and signs out an account that is not on the allowlist', async () => {
    const api = fakeApi()
    const store = createAccessStore(api)
    expect(await store.getState().signInAdmin('a@b.c', 'secret')).toBe(
      'not_admin',
    )
    expect(api.signOut).toHaveBeenCalled()
    expect(store.getState().status).toBe(ACCESS.locked)
  })

  it('enters admin preview for an allowlisted account', async () => {
    const store = createAccessStore(
      fakeApi({ isAdmin: vi.fn(async () => true) }),
    )
    expect(await store.getState().signInAdmin('a@b.c', 'secret')).toBeNull()
    expect(store.getState().status).toBe(ACCESS.admin)
  })

  it('passes through wrong credentials', async () => {
    const store = createAccessStore(
      fakeApi({ signInWithPassword: failWith('invalid_credentials') }),
    )
    expect(await store.getState().signInAdmin('a@b.c', 'x')).toBe(
      'invalid_credentials',
    )
  })
})
