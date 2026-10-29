import { describe, expect, it } from 'vitest'
import {
  anchorFromPoint,
  createActiveTimer,
  formatCommentTime,
  nextReaction,
  numberPins,
  validateComment,
} from './feedbackModel'

describe('nextReaction', () => {
  it('sets, switches and clears a like', () => {
    expect(nextReaction(null, 'like')).toBe('like')
    expect(nextReaction('like', 'dislike')).toBe('dislike')
    expect(nextReaction('dislike', 'dislike')).toBeNull()
  })
})

describe('pins', () => {
  it('numbers only pinned comments, in posting order', () => {
    const numbers = numberPins([
      { id: 'a', anchor_area: 'phone' },
      { id: 'b', anchor_area: null },
      { id: 'c', anchor_area: 'content' },
    ])
    expect([...numbers]).toEqual([
      ['a', 1],
      ['c', 2],
    ])
  })

  it('stores a click as a fraction of the area and clamps edges', () => {
    const rect = { left: 100, top: 50, width: 200, height: 400 }
    expect(anchorFromPoint('phone', rect, 150, 250)).toEqual({
      area: 'phone',
      x: 0.25,
      y: 0.5,
    })
    expect(anchorFromPoint('phone', rect, 400, 0)).toMatchObject({
      x: 1,
      y: 0,
    })
  })
})

describe('validateComment', () => {
  it('rejects blank text and accepts Azerbaijani text', () => {
    expect(validateComment({ body: '   ', name: '' })).toBe('empty')
    expect(validateComment({ body: 'Çox gözəl ə ğ ı ö ş ü', name: '' })).toBe(
      null,
    )
  })

  it('enforces the server limits', () => {
    expect(validateComment({ body: 'a'.repeat(2001), name: '' })).toBe(
      'too_long',
    )
    expect(validateComment({ body: 'ok', name: 'x'.repeat(81) })).toBe(
      'name_too_long',
    )
  })
})

describe('formatCommentTime', () => {
  it('shows only the time for today and the date otherwise', () => {
    const now = new Date(2026, 9, 21, 18, 0)
    expect(formatCommentTime(new Date(2026, 9, 21, 9, 5), now)).toBe('09:05')
    expect(formatCommentTime(new Date(2026, 9, 20, 14, 30), now)).toBe(
      '20.10 14:30',
    )
  })
})

describe('createActiveTimer', () => {
  function setup(idleMs = 60_000) {
    let t = 0
    const timer = createActiveTimer({ now: () => t, idleMs })
    return { timer, advance: (ms) => (t += ms) }
  }

  it('counts visible time up to the idle limit', () => {
    const { timer, advance } = setup()
    advance(30_000)
    expect(timer.take()).toBe(30_000)
    advance(120_000)
    expect(timer.take()).toBe(30_000)
  })

  it('restarts counting after new activity', () => {
    const { timer, advance } = setup()
    advance(100_000)
    timer.activity()
    advance(10_000)
    expect(timer.take()).toBe(70_000)
  })

  it('does not count hidden time', () => {
    const { timer, advance } = setup()
    advance(5_000)
    timer.setVisible(false)
    advance(40_000)
    timer.setVisible(true)
    advance(5_000)
    expect(timer.take()).toBe(10_000)
  })

  it('resets after take so time is never reported twice', () => {
    const { timer, advance } = setup()
    advance(2_000)
    timer.take()
    expect(timer.take()).toBe(0)
  })
})
