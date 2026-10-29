import { describe, expect, it, vi } from 'vitest'
import { createDemoPlayer } from './createDemoPlayer'
import { createDemoSession } from './demoSession'

function counterModel(group) {
  return {
    group,
    createInitialState: () => ({ count: 0, log: [] }),
    reduce: (state, action) =>
      action.type === 'add'
        ? {
            count: state.count + action.amount,
            log: [...state.log, action.amount],
          }
        : state,
  }
}

describe('createDemoSession', () => {
  it('shares one store between scenarios of the same group', () => {
    const session = createDemoSession()
    const guestModel = counterModel('orders')
    const adminModel = { ...counterModel('orders') }

    session.getStore(guestModel).getState().dispatch({ type: 'add', amount: 2 })
    expect(session.getStore(adminModel).getState().state.count).toBe(2)
  })

  it('isolates different groups', () => {
    const session = createDemoSession()
    session
      .getStore(counterModel('orders'))
      .getState()
      .dispatch({ type: 'add', amount: 2 })
    expect(session.getStore(counterModel('chat')).getState().state.count).toBe(
      0,
    )
  })

  it('reset always restores the same initial state', () => {
    const session = createDemoSession()
    const store = session.getStore(counterModel('orders'))
    store.getState().dispatch({ type: 'add', amount: 5 })
    store.getState().reset()
    expect(store.getState().state).toEqual({ count: 0, log: [] })
  })

  it('autoplay and manual dispatch of the same actions end in the same state', () => {
    const steps = [
      { id: 'one', delayMs: 0, action: { type: 'add', amount: 1 } },
      { id: 'two', delayMs: 0, action: { type: 'add', amount: 3 } },
    ]
    const manual = createDemoSession().getStore(counterModel('x'))
    steps.forEach((step) => manual.getState().dispatch(step.action))

    const auto = createDemoSession().getStore(counterModel('x'))
    vi.useFakeTimers()
    try {
      const player = createDemoPlayer({
        steps,
        run: (step) => auto.getState().dispatch(step.action),
        reset: () => auto.getState().reset(),
      })
      player.play()
      vi.runAllTimers()
    } finally {
      vi.useRealTimers()
    }

    expect(auto.getState().state).toEqual(manual.getState().state)
  })
})
