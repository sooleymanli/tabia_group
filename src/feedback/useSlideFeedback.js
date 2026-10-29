import { useEffect, useState } from 'react'
import { ACCESS, useAccess } from '@/access/accessStore'
import {
  canRestore,
  captureDemoContext,
  pinMatchesView,
} from '@/demo/demoContext'
import { useDemoView } from '@/demo/useDemoView'
import { isPinned, numberPins } from './feedbackModel'
import { useMyReactions } from './useMyReactions'
import { useSlideComments } from './useSlideComments'
import { useSlideTracking } from './useSlideTracking'

const NO_PINS = { slideId: null, placing: false, draft: null, activeId: null }

// Everything the shell needs for feedback on the current slide. Viewers write feedback; the admin
// preview only reads and replies; nothing here touches the demo store except reopening a pin's view.
export function useSlideFeedback({ deckId, slideId, runtime }) {
  const status = useAccess((state) => state.status)
  const mode =
    status === ACCESS.viewer
      ? 'viewer'
      : status === ACCESS.admin
        ? 'admin'
        : null
  const isViewer = mode === 'viewer'

  const [panelOpen, setPanelOpen] = useState(false)
  const reactions = useMyReactions(deckId, isViewer)
  useSlideTracking({ deckId, slideId, enabled: isViewer })
  const comments = useSlideComments(deckId, slideId, mode)
  const pinNumbers = numberPins(comments.items)

  const view = useDemoView(runtime)
  const scenarioId = runtime.scenario?.id ?? null
  const visiblePins = comments.items.filter(
    (comment) =>
      isPinned(comment) &&
      pinMatchesView(comment.anchor_context, scenarioId, view),
  )

  // Pin placement belongs to one slide; switching slides drops it.
  const [pinState, setPinState] = useState(NO_PINS)
  const pins = pinState.slideId === slideId ? pinState : NO_PINS
  const updatePins = (patch) =>
    setPinState((state) => ({
      ...(state.slideId === slideId ? state : NO_PINS),
      ...patch,
      slideId,
    }))

  useEffect(() => {
    if (!pins.placing && !pins.draft) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setPinState((state) => ({ ...state, placing: false, draft: null }))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [pins.placing, pins.draft])

  const select = (id) => {
    const context = comments.items.find((c) => c.id === id)?.anchor_context
    if (
      !pinMatchesView(context, scenarioId, view) &&
      canRestore(context, scenarioId)
    ) {
      runtime.player.stop()
      runtime.store.getState().restore(context.state)
    }
    setPanelOpen(true)
    updatePins({ activeId: id })
  }

  return {
    mode,
    reactions,
    comments,
    pinNumbers,
    visiblePins,
    pins,
    pinsVisible:
      mode !== null && (panelOpen || pins.placing || pins.draft !== null),
    panelOpen,
    togglePanel: () => setPanelOpen((open) => !open),
    closePanel: () => setPanelOpen(false),
    select,
    togglePlacing: () => {
      if (!pins.placing) runtime.player.pause()
      updatePins({ placing: !pins.placing, draft: null })
    },
    place: (anchor) => {
      const context =
        anchor.area === 'content'
          ? null
          : captureDemoContext(
              runtime.scenario,
              runtime.store?.getState().state ?? null,
            )
      updatePins({ placing: false, draft: { ...anchor, context } })
    },
    cancelDraft: () => updatePins({ draft: null }),
    sent: (id) => {
      comments.reload()
      setPanelOpen(true)
      updatePins({ draft: null, activeId: id })
    },
  }
}
