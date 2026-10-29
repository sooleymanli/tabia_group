import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createDemoPlayer, PLAYER_STATUS } from './createDemoPlayer'

const steps = [
  { id: 'a', delayMs: 100, action: { type: 'add', amount: 1 } },
  { id: 'b', delayMs: 200, action: { type: 'add', amount: 10 } },
  { id: 'c', delayMs: 300, action: { type: 'add', amount: 100 } },
]

function setup() {
  let total = 0
  const run = vi.fn((step) => {
    total += step.action.amount
  })
  const reset = vi.fn(() => {
    total = 0
  })
  const player = createDemoPlayer({ steps, run, reset })
  return { player, run, reset, getTotal: () => total }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('createDemoPlayer', () => {
  it('runs steps in order after their delays and then finishes', () => {
    const { player, run, getTotal } = setup()
    player.play()
    expect(player.getStatus()).toBe(PLAYER_STATUS.playing)

    vi.advanceTimersByTime(99)
    expect(run).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(getTotal()).toBe(1)
    vi.advanceTimersByTime(500)
    expect(run.mock.calls.map(([step]) => step.id)).toEqual(['a', 'b', 'c'])
    expect(getTotal()).toBe(111)
    expect(player.getStatus()).toBe(PLAYER_STATUS.finished)
  })

  it('keeps the remaining delay across pause and resume', () => {
    const { player, run } = setup()
    player.play()
    vi.advanceTimersByTime(60)
    player.pause()
    vi.advanceTimersByTime(10_000)
    expect(run).not.toHaveBeenCalled()

    player.resume()
    vi.advanceTimersByTime(39)
    expect(run).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('never fires after dispose, so leaving a slide stops autoplay', () => {
    const { player, run } = setup()
    player.play()
    vi.advanceTimersByTime(100)
    player.dispose()
    vi.advanceTimersByTime(10_000)
    expect(run).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('replays from the reset state instead of stacking on manual changes', () => {
    const { player, reset, getTotal } = setup()
    player.play()
    vi.runAllTimers()
    expect(getTotal()).toBe(111)

    player.play()
    expect(reset).toHaveBeenCalledTimes(2)
    expect(getTotal()).toBe(0)
    vi.runAllTimers()
    expect(getTotal()).toBe(111)
  })

  it('stop clears pending steps and returns to idle', () => {
    const { player, run } = setup()
    player.play()
    player.stop()
    vi.runAllTimers()
    expect(run).not.toHaveBeenCalled()
    expect(player.getStatus()).toBe(PLAYER_STATUS.idle)
  })

  it('notifies status listeners and step listeners', () => {
    const { player } = setup()
    const statuses = []
    const stepIds = []
    player.subscribe(() => statuses.push(player.getStatus()))
    player.onStep((step) => stepIds.push(step.id))
    player.play()
    vi.advanceTimersByTime(100)
    player.pause()
    player.resume()
    vi.runAllTimers()
    expect(statuses).toEqual(['playing', 'paused', 'playing', 'finished'])
    expect(stepIds).toEqual(['a', 'b', 'c'])
  })
})
