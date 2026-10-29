import { useEffect, useState } from 'react'
import { accessStore } from '@/access/accessStore'
import {
  adminListComments,
  listSlideComments,
} from '@/lib/supabase/presentationApi'

// Viewers get the safe projection; the admin preview gets every comment (oldest first, like pins).
const SOURCES = {
  viewer: listSlideComments,
  admin: async (deckId, slideId) =>
    ((await adminListComments(deckId, slideId)) ?? []).toReversed(),
}

// `mode` is 'viewer', 'admin' or null (nothing to load).
export function useSlideComments(deckId, slideId, mode) {
  const key = `${mode}/${deckId}/${slideId}`
  const [state, setState] = useState({
    key: null,
    status: 'loading',
    items: [],
  })
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!mode) return
    let cancelled = false
    SOURCES[mode](deckId, slideId)
      .then((items) => {
        if (!cancelled) setState({ key, status: 'ready', items: items ?? [] })
      })
      .catch((error) => {
        if (cancelled) return
        setState({ key, status: 'error', items: [] })
        accessStore.getState().handleApiError(error)
      })
    return () => {
      cancelled = true
    }
  }, [deckId, slideId, key, mode, reloadToken])

  const current = state.key === key ? state : { status: 'loading', items: [] }
  return { ...current, reload: () => setReloadToken((n) => n + 1) }
}
