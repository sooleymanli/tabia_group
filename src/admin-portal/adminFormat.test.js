import { describe, expect, it } from 'vitest'
import {
  formatDuration,
  pinState,
  slideOrder,
  slideTitle,
  summarize,
} from './adminFormat'

describe('admin formatting', () => {
  it('formats active time for people, not milliseconds', () => {
    expect(formatDuration(42_000)).toBe('42 san')
    expect(formatDuration(260_000)).toBe('4 dəq 20 san')
    expect(formatDuration(3_900_000)).toBe('1 saat 5 dəq')
  })

  it('resolves slide titles and keeps deck order', () => {
    expect(slideTitle('mvp', 'food-order')).toBe('Yemək sifarişi')
    expect(slideTitle('mvp', 'gone')).toBe('mvp/gone')
    expect(slideOrder('mvp', 'overview')).toBeLessThan(
      slideOrder('mvp', 'food-order'),
    )
  })

  it('treats a past expiry as expired even if still flagged active', () => {
    const now = Date.parse('2026-10-22T12:00:00Z')
    expect(pinState({ is_active: true, expires_at: null }, now)).toBe('active')
    expect(
      pinState({ is_active: true, expires_at: '2026-10-21T00:00:00Z' }, now),
    ).toBe('expired')
    expect(pinState({ is_active: false }, now)).toBe('inactive')
  })

  it('summarizes counts and unanswered questions', () => {
    const summary = summarize({
      comments: [
        { status: 'new', kind: 'question', replies: [] },
        { status: 'reviewed', kind: 'question', replies: [{ id: 'r' }] },
        { status: 'new', kind: 'comment', replies: [] },
      ],
      pins: [
        { is_active: true, sessions: 2, last_seen_at: '2026-10-21T10:00:00Z' },
        { is_active: false, sessions: 1, last_seen_at: '2026-10-22T09:00:00Z' },
      ],
      slides: [
        { views: 5, active_ms: 1000, likes: 2, dislikes: 1 },
        { views: 3, active_ms: 500, likes: 0, dislikes: 0 },
      ],
    })
    expect(summary).toMatchObject({
      activePins: 1,
      totalPins: 2,
      sessions: 3,
      lastSeen: '2026-10-22T09:00:00Z',
      views: 8,
      activeMs: 1500,
      likes: 2,
      newComments: 2,
      openQuestions: 1,
    })
  })
})
