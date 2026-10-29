export const COMMENT_KINDS = [
  { value: 'comment', label: 'Şərh' },
  { value: 'suggestion', label: 'Təklif' },
  { value: 'question', label: 'Sual' },
]

export const COMMENT_MAX_LENGTH = 2000
export const NAME_MAX_LENGTH = 80
export const ANONYMOUS_NAME = 'Anonim'

export const VISIBILITY_LABELS = {
  vendor: 'Yalnız Developer Team',
  public: 'PIN ilə daxil olan hər kəs',
}

export const COMMENT_STATUS_LABELS = {
  new: 'Yeni',
  reviewed: 'Baxıldı',
  resolved: 'Həll edildi',
}

export const REPLY_VISIBILITY_LABELS = {
  public: 'Rəyi görən hər kəs',
  pin: 'Yalnız rəyin PIN sahibi',
}

export const kindLabel = (kind) =>
  COMMENT_KINDS.find((item) => item.value === kind)?.label ?? kind

// Clicking the active reaction again clears it.
export function nextReaction(current, clicked) {
  return current === clicked ? null : clicked
}

export const isPinned = (comment) => comment.anchor_area != null

// Pins are numbered in posting order, like Figma comment markers.
export function numberPins(comments) {
  const numbers = new Map()
  for (const comment of comments) {
    if (isPinned(comment)) numbers.set(comment.id, numbers.size + 1)
  }
  return numbers
}

const clamp01 = (value) => Math.min(1, Math.max(0, value))

export function anchorFromPoint(area, rect, clientX, clientY) {
  return {
    area,
    x: clamp01((clientX - rect.left) / rect.width),
    y: clamp01((clientY - rect.top) / rect.height),
  }
}

export function validateComment({ body, name }) {
  const text = body.trim()
  if (!text) return 'empty'
  if (text.length > COMMENT_MAX_LENGTH) return 'too_long'
  if (name.trim().length > NAME_MAX_LENGTH) return 'name_too_long'
  return null
}

const pad = (value) => String(value).padStart(2, '0')

export function formatCommentTime(iso, now = new Date()) {
  const date = new Date(iso)
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`
  const sameDay = date.toDateString() === now.toDateString()
  return sameDay
    ? time
    : `${pad(date.getDate())}.${pad(date.getMonth() + 1)} ${time}`
}

// Counts only time the page is visible and the viewer was active within `idleMs`.
export function createActiveTimer({ now = Date.now, idleMs } = {}) {
  let active = 0
  let lastTick = now()
  let lastActivity = lastTick
  let visible = true

  const advance = () => {
    const t = now()
    if (visible) {
      const activeUntil = Math.min(t, lastActivity + idleMs)
      if (activeUntil > lastTick) active += activeUntil - lastTick
    }
    lastTick = t
  }

  return {
    activity() {
      advance()
      lastActivity = lastTick
    },
    setVisible(isVisible) {
      advance()
      visible = isVisible
      if (isVisible) lastActivity = lastTick
    },
    take() {
      advance()
      const ms = active
      active = 0
      return ms
    },
  }
}
