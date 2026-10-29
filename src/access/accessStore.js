import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'
import { forgetReviewerName } from '@/feedback/reviewerName'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import * as presentationApi from '@/lib/supabase/presentationApi'

export const ACCESS = {
  checking: 'checking',
  unavailable: 'unavailable',
  error: 'error',
  locked: 'locked',
  chooseVisibility: 'choose-visibility',
  viewer: 'viewer',
  admin: 'admin',
}

export const NOTICE = { ended: 'ended', signedOut: 'signed-out' }

const toSession = (result) => ({
  visibility: result.visibility,
  expiresAt: result.expires_at,
})

const codeOf = (error) => error?.code ?? 'network'

// UI state only: every permission is enforced again by the database on each request.
export function createAccessStore(api) {
  let checkRun = 0

  return createStore((set, get) => {
    const lock = (notice) =>
      set({
        status: ACCESS.locked,
        session: null,
        ...(notice !== undefined && { notice }),
      })

    async function check() {
      const run = ++checkRun
      const apply = (next) => {
        if (run === checkRun) set(next)
      }
      if (!api.isConfigured) return apply({ status: ACCESS.unavailable })

      try {
        const user = await api.getCurrentUser()
        if (!user) return apply({ status: ACCESS.locked, session: null })
        if (!user.is_anonymous && (await api.isAdmin(user.id))) {
          return apply({ status: ACCESS.admin, session: null, notice: null })
        }
        const session = await api.getMySession()
        apply(
          session
            ? { status: ACCESS.viewer, session: toSession(session) }
            : { status: ACCESS.locked, session: null },
        )
      } catch {
        apply({ status: ACCESS.error })
      }
    }

    return {
      status: ACCESS.checking,
      session: null,
      notice: null,

      check,

      // Redeems with the safe "vendor" default; the viewer may widen it in the next step.
      async submitPin(pin) {
        checkRun++
        set({ notice: null })
        try {
          const result = await api.redeemPin(pin, 'vendor')
          set({ status: ACCESS.chooseVisibility, session: toSession(result) })
          return null
        } catch (error) {
          if (error?.code === 'admin_preview') {
            await check()
            return null
          }
          return codeOf(error)
        }
      },

      async chooseVisibility(visibility) {
        const { session } = get()
        if (visibility === 'public') {
          try {
            await api.setFeedbackVisibility('public')
          } catch (error) {
            if (error?.code === 'no_session') {
              lock(NOTICE.ended)
              return null
            }
            return codeOf(error)
          }
        }
        set({ status: ACCESS.viewer, session: { ...session, visibility } })
        return null
      },

      // Applies to feedback written from now on; earlier comments keep their visibility.
      async updateVisibility(visibility) {
        try {
          await api.setFeedbackVisibility(visibility)
        } catch (error) {
          if (error?.code === 'no_session') {
            lock(NOTICE.ended)
            return null
          }
          return codeOf(error)
        }
        if (get().status === ACCESS.viewer) {
          set({ session: { ...get().session, visibility } })
        }
        return null
      },

      // Any API call may find the session revoked; let the gate re-check instead of failing silently.
      handleApiError(error) {
        if (error?.code === 'no_session' || error?.code === 'forbidden') {
          get().revalidate()
        }
      },

      async revalidate() {
        const { status } = get()
        if (status === ACCESS.admin) return check()
        if (status !== ACCESS.viewer && status !== ACCESS.chooseVisibility) {
          return
        }
        try {
          const session = await api.getMySession()
          if (get().status !== status) return
          if (!session) lock(NOTICE.ended)
          else set({ session: { ...get().session, ...toSession(session) } })
        } catch {
          // A transient network error keeps the current view; the server still rejects stale access.
        }
      },

      async signInAdmin(email, password) {
        checkRun++
        try {
          const user = await api.signInWithPassword(email, password)
          if (!(await api.isAdmin(user.id))) {
            await api.signOut().catch(() => {})
            lock(null)
            return 'not_admin'
          }
          set({ status: ACCESS.admin, session: null, notice: null })
          return null
        } catch (error) {
          return codeOf(error)
        }
      },

      async signOut() {
        checkRun++
        const { status } = get()
        if (status === ACCESS.viewer || status === ACCESS.chooseVisibility) {
          await api.endMySession().catch(() => {})
        }
        await api.signOut().catch(() => {})
        api.clearLocalData?.()
        lock(NOTICE.signedOut)
      },
    }
  })
}

export const accessStore = createAccessStore({
  isConfigured: isSupabaseConfigured,
  getCurrentUser: presentationApi.getCurrentUser,
  isAdmin: presentationApi.isAdminUser,
  redeemPin: presentationApi.redeemPin,
  getMySession: presentationApi.getMySession,
  setFeedbackVisibility: presentationApi.setFeedbackVisibility,
  endMySession: presentationApi.endMySession,
  signInWithPassword: presentationApi.signInWithPassword,
  signOut: presentationApi.signOut,
  clearLocalData: forgetReviewerName,
})

export const useAccess = (selector) => useStore(accessStore, selector)
