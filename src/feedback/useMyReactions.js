import { useEffect, useState } from 'react'
import { accessStore } from '@/access/accessStore'
import { myReactions, setReaction } from '@/lib/supabase/presentationApi'
import { nextReaction } from './feedbackModel'

const LIKE = 'like'

// The viewer's own like/dislike per slide; counts stay vendor-only (README 24.3).
export function useMyReactions(deckId, enabled) {
  const [values, setValues] = useState({})
  const [pending, setPending] = useState({})
  const [failed, setFailed] = useState(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    myReactions(deckId)
      .then((rows) => {
        if (cancelled) return
        const own = {}
        for (const row of rows ?? []) {
          if (row.kind === LIKE && row.target_id === '') {
            own[row.slide_id] = row.value
          }
        }
        setValues(own)
      })
      .catch((error) => accessStore.getState().handleApiError(error))
    return () => {
      cancelled = true
    }
  }, [deckId, enabled])

  const toggle = async (slideId, clicked) => {
    const previous = values[slideId] ?? null
    const value = nextReaction(previous, clicked)
    setFailed(null)
    setPending((state) => ({ ...state, [slideId]: true }))
    setValues((state) => ({ ...state, [slideId]: value }))
    try {
      await setReaction({ deckId, slideId, kind: LIKE, value })
    } catch (error) {
      setValues((state) => ({ ...state, [slideId]: previous }))
      setFailed(slideId)
      accessStore.getState().handleApiError(error)
    } finally {
      setPending((state) => ({ ...state, [slideId]: false }))
    }
  }

  return { values, pending, failed, toggle }
}
