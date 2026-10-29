// Autoplay timeline. Steps carry plain actions so autoplay goes through the same reducer as manual taps.
export const PLAYER_STATUS = {
  idle: 'idle',
  playing: 'playing',
  paused: 'paused',
  finished: 'finished',
}

export function createDemoPlayer({
  steps = [],
  run,
  reset,
  now = () => Date.now(),
}) {
  let status = PLAYER_STATUS.idle
  let index = 0
  let timer = null
  let dueAt = 0
  let remaining = 0
  const statusListeners = new Set()
  const stepListeners = new Set()

  function setStatus(next) {
    if (status === next) return
    status = next
    statusListeners.forEach((listener) => listener())
  }

  function clear() {
    if (timer === null) return
    clearTimeout(timer)
    timer = null
  }

  function schedule(delay) {
    clear()
    dueAt = now() + delay
    timer = setTimeout(tick, delay)
  }

  function tick() {
    timer = null
    const step = steps[index]
    index += 1
    stepListeners.forEach((listener) => listener(step))
    run(step)
    if (index >= steps.length) setStatus(PLAYER_STATUS.finished)
    else schedule(steps[index].delayMs)
  }

  return {
    hasSteps: steps.length > 0,
    getStatus: () => status,
    subscribe(listener) {
      statusListeners.add(listener)
      return () => statusListeners.delete(listener)
    },
    onStep(listener) {
      stepListeners.add(listener)
      return () => stepListeners.delete(listener)
    },
    // Always replays from the scenario's initial state, whatever the presenter clicked before.
    play() {
      clear()
      reset()
      index = 0
      if (!steps.length) return
      setStatus(PLAYER_STATUS.playing)
      schedule(steps[0].delayMs)
    },
    pause() {
      if (status !== PLAYER_STATUS.playing) return
      remaining = Math.max(0, dueAt - now())
      clear()
      setStatus(PLAYER_STATUS.paused)
    },
    resume() {
      if (status !== PLAYER_STATUS.paused) return
      setStatus(PLAYER_STATUS.playing)
      schedule(remaining)
    },
    stop() {
      clear()
      setStatus(PLAYER_STATUS.idle)
    },
    dispose() {
      clear()
      status = PLAYER_STATUS.idle
    },
  }
}
