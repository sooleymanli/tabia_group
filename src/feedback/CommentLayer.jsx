import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { CommentForm } from './CommentForm'
import { ANONYMOUS_NAME, anchorFromPoint, isPinned } from './feedbackModel'
import { PinMarker } from './PinMarker'

const DRAFT_ID = 'draft'
const COMPOSER_WIDTH = 320
const COMPOSER_HEIGHT = 380
const GAP = 12

function findArea(container, layer, clientX, clientY) {
  for (const element of document.elementsFromPoint(clientX, clientY)) {
    if (layer.contains(element)) continue
    const area = element.closest('[data-comment-area]')
    if (area && container.contains(area)) return area
  }
  return container
}

// Positions are re-measured every frame while shown: the phone rescales and slides animate,
// and a few getBoundingClientRect calls are cheaper than wiring observers to every frame.
function usePinPositions(layerRef, targets, enabled) {
  const [measured, setMeasured] = useState({ pins: {}, width: 0, height: 0 })
  const targetsKey = JSON.stringify(targets)

  useEffect(() => {
    if (!enabled) return
    const list = JSON.parse(targetsKey)
    let frame
    let last = ''
    const measure = () => {
      const container = layerRef.current?.parentElement
      if (container) {
        const base = container.getBoundingClientRect()
        const pins = {}
        for (const target of list) {
          const area =
            target.area === 'content'
              ? container
              : container.querySelector(`[data-comment-area="${target.area}"]`)
          if (!area) continue
          const rect = area.getBoundingClientRect()
          pins[target.id] = {
            left: Math.round(rect.left - base.left + target.x * rect.width),
            top: Math.round(rect.top - base.top + target.y * rect.height),
          }
        }
        const next = {
          pins,
          width: Math.round(base.width),
          height: Math.round(base.height),
        }
        const serialized = JSON.stringify(next)
        if (serialized !== last) {
          last = serialized
          setMeasured(next)
        }
      }
      frame = requestAnimationFrame(measure)
    }
    frame = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(frame)
  }, [layerRef, targetsKey, enabled])

  return measured
}

function composerStyle(position, width, height) {
  const composerWidth = Math.min(COMPOSER_WIDTH, width - GAP * 2)
  const fitsRight = position.left + GAP + composerWidth <= width
  const left = fitsRight
    ? position.left + GAP
    : Math.max(GAP, position.left - GAP - composerWidth)
  const top = Math.max(
    GAP,
    Math.min(position.top - 24, height - COMPOSER_HEIGHT - GAP),
  )
  return { left, top, width: composerWidth }
}

export function CommentLayer({
  deckId,
  slideId,
  comments,
  pinNumbers,
  visible,
  placing,
  draft,
  activeId,
  onPlace,
  onSelect,
  onCancelDraft,
  onSent,
}) {
  const layerRef = useRef(null)
  const pinned = visible ? comments.filter(isPinned) : []
  const targets = pinned.map((comment) => ({
    id: comment.id,
    area: comment.anchor_area,
    x: comment.anchor_x,
    y: comment.anchor_y,
  }))
  if (draft) {
    targets.push({ id: DRAFT_ID, area: draft.area, x: draft.x, y: draft.y })
  }
  const {
    pins: positions,
    width,
    height,
  } = usePinPositions(layerRef, targets, targets.length > 0)

  const place = (event) => {
    const layer = layerRef.current
    const container = layer.parentElement
    const area = findArea(container, layer, event.clientX, event.clientY)
    const name = area === container ? 'content' : area.dataset.commentArea
    onPlace(
      anchorFromPoint(
        name,
        area.getBoundingClientRect(),
        event.clientX,
        event.clientY,
      ),
    )
  }

  return (
    <div
      ref={layerRef}
      onClick={placing ? place : undefined}
      className={cn(
        'absolute inset-0 z-30',
        placing ? 'cursor-crosshair' : 'pointer-events-none',
      )}
    >
      <AnimatePresence>
        {placing && (
          <motion.p
            role="status"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm whitespace-nowrap text-mist shadow-lg"
          >
            Rəy yazmaq istədiyiniz yerə klikləyin. Ləğv etmək üçün Esc.
          </motion.p>
        )}
      </AnimatePresence>

      {pinned.map((comment) => {
        const position = positions[comment.id]
        if (!position) return null
        const number = pinNumbers.get(comment.id)
        const author = comment.author_name || ANONYMOUS_NAME
        return (
          <PinMarker
            key={comment.id}
            position={position}
            number={number}
            own={comment.is_own}
            resolved={comment.status === 'resolved'}
            active={comment.id === activeId}
            label={`${number}. ${author}: ${comment.body.slice(0, 80)}`}
            onClick={(event) => {
              event.stopPropagation()
              onSelect(comment.id)
            }}
          />
        )
      })}

      {draft && positions[DRAFT_ID] && (
        <>
          <PinMarker
            draft
            position={positions[DRAFT_ID]}
            label="Yeni rəyin yeri"
            onClick={(event) => event.stopPropagation()}
          />
          <motion.div
            role="dialog"
            aria-label="Bu yer üçün rəy"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            style={composerStyle(positions[DRAFT_ID], width, height)}
            onClick={(event) => event.stopPropagation()}
            className="pointer-events-auto absolute rounded-xl border bg-card p-4 shadow-xl"
          >
            <CommentForm
              compact
              deckId={deckId}
              slideId={slideId}
              anchor={draft}
              onSent={onSent}
              onCancel={onCancelDraft}
            />
          </motion.div>
        </>
      )}
    </div>
  )
}
