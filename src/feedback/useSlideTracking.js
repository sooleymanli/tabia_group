import { useEffect, useRef } from 'react'
import { ACCESS, accessStore } from '@/access/accessStore'
import { recordSlideEvent } from '@/lib/supabase/presentationApi'
import { createActiveTimer } from './feedbackModel'

// Autoplay demos run without input, so the idle limit is generous.
const IDLE_MS = 2 * 60 * 1000
const MIN_ACTIVE_MS = 1000
const MAX_ACTIVE_MS = 60 * 60 * 1000
const RETRY_DELAYS_MS = [3000, 10000]
const ACTIVITY_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'wheel']

// Events carry a client id, so a retry after a lost response is ignored by the server.
async function send(event, attempt = 0) {
  // After sign-out or revocation the unmount flush has no session to write to.
  if (accessStore.getState().status !== ACCESS.viewer) return
  try {
    await recordSlideEvent(event)
  } catch (error) {
    if (error?.code === 'no_session') {
      accessStore.getState().handleApiError(error)
    } else if (attempt < RETRY_DELAYS_MS.length) {
      setTimeout(() => send(event, attempt + 1), RETRY_DELAYS_MS[attempt])
    }
  }
}

export function useSlideTracking({ deckId, slideId, enabled }) {
  // Kept across StrictMode's effect replay so the repeated "view" reuses the same id.
  const viewRef = useRef(null)

  useEffect(() => {
    if (!enabled) return
    if (viewRef.current?.slideId !== slideId) {
      viewRef.current = { slideId, id: crypto.randomUUID() }
    }
    send({ id: viewRef.current.id, deckId, slideId, type: 'view' })

    const timer = createActiveTimer({ idleMs: IDLE_MS })
    const flush = () => {
      const ms = timer.take()
      if (ms < MIN_ACTIVE_MS) return
      send({
        id: crypto.randomUUID(),
        deckId,
        slideId,
        type: 'active_time',
        durationMs: Math.min(Math.round(ms), MAX_ACTIVE_MS),
      })
    }
    const onActivity = () => timer.activity()
    const onVisibility = () => {
      const visible = document.visibilityState === 'visible'
      timer.setVisible(visible)
      if (!visible) flush()
    }

    for (const type of ACTIVITY_EVENTS) {
      window.addEventListener(type, onActivity, { passive: true })
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', flush)

    return () => {
      for (const type of ACTIVITY_EVENTS) {
        window.removeEventListener(type, onActivity)
      }
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [deckId, slideId, enabled])
}
