import { DECKS, getDeck } from '@/presentation/decks'

const pad = (value) => String(value).padStart(2, '0')

export function formatDateTime(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function formatDuration(ms) {
  const seconds = Math.round((ms ?? 0) / 1000)
  if (seconds < 60) return `${seconds} san`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} dəq ${seconds % 60} san`
  return `${Math.floor(minutes / 60)} saat ${minutes % 60} dəq`
}

export function slideTitle(deckId, slideId) {
  const deck = getDeck(deckId)
  const slide = deck?.slides.find((item) => item.id === slideId)
  return slide ? slide.title : `${deckId}/${slideId}`
}

export function deckTitle(deckId) {
  return getDeck(deckId)?.title ?? deckId
}

// Slide order as presented, so tables follow the deck instead of database order.
export function slideOrder(deckId, slideId) {
  const deckIndex = DECKS.findIndex((deck) => deck.id === deckId)
  const slideIndex =
    DECKS[deckIndex]?.slides.findIndex((slide) => slide.id === slideId) ?? -1
  return (
    (deckIndex < 0 ? 999 : deckIndex) * 1000 +
    (slideIndex < 0 ? 999 : slideIndex)
  )
}

export function pinState(pin, now = Date.now()) {
  if (!pin.is_active) return 'inactive'
  if (pin.expires_at && Date.parse(pin.expires_at) <= now) return 'expired'
  return 'active'
}

export const PIN_STATE_LABELS = {
  active: 'Aktiv',
  inactive: 'Deaktiv',
  expired: 'Vaxtı bitib',
}

export function summarize({ comments, pins, slides }) {
  return {
    activePins: pins.filter((pin) => pinState(pin) === 'active').length,
    totalPins: pins.length,
    sessions: pins.reduce((sum, pin) => sum + Number(pin.sessions ?? 0), 0),
    lastSeen: pins
      .map((pin) => pin.last_seen_at)
      .filter(Boolean)
      .sort()
      .at(-1),
    views: slides.reduce((sum, row) => sum + Number(row.views ?? 0), 0),
    activeMs: slides.reduce((sum, row) => sum + Number(row.active_ms ?? 0), 0),
    likes: slides.reduce((sum, row) => sum + Number(row.likes ?? 0), 0),
    dislikes: slides.reduce((sum, row) => sum + Number(row.dislikes ?? 0), 0),
    newComments: comments.filter((comment) => comment.status === 'new').length,
    openQuestions: comments.filter(
      (comment) => comment.kind === 'question' && !comment.replies?.length,
    ).length,
    comments: comments.length,
  }
}
