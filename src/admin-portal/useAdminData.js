import { useEffect, useState } from 'react'
import { accessStore } from '@/access/accessStore'
import {
  adminListComments,
  adminPinOverview,
  adminSlideStats,
} from '@/lib/supabase/presentationApi'

const EMPTY = { comments: [], pins: [], slides: [] }

// One load for the whole panel; "Yenilə" and every mutation call reload().
export function useAdminData() {
  const [data, setData] = useState(EMPTY)
  const [status, setStatus] = useState('loading')
  const [loadedAt, setLoadedAt] = useState(null)
  const [token, setToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.all([adminListComments(), adminPinOverview(), adminSlideStats()])
      .then(([comments, pins, slides]) => {
        if (cancelled) return
        setData({
          comments: comments ?? [],
          pins: pins ?? [],
          slides: slides ?? [],
        })
        setStatus('ready')
        setLoadedAt(new Date())
      })
      .catch((error) => {
        if (cancelled) return
        setStatus('error')
        accessStore.getState().handleApiError(error)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  return {
    ...data,
    status,
    loadedAt,
    reload: () => setToken((n) => n + 1),
  }
}
