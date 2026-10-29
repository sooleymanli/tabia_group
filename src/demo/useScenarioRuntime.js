import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { createDemoPlayer, PLAYER_STATUS } from './createDemoPlayer'

const NO_STEPS = []

// Binds one slide's scenario to its group store and an autoplay player; timers die with the slide.
export function useScenarioRuntime(session, scenario) {
  const store = scenario ? session.getStore(scenario.model) : null
  const steps = scenario?.steps ?? NO_STEPS

  const player = useMemo(
    () =>
      createDemoPlayer({
        steps,
        run: (step) => store?.getState().dispatch(step.action),
        reset: () => store?.getState().reset(),
      }),
    [store, steps],
  )

  const status = useSyncExternalStore(player.subscribe, player.getStatus)

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) player.pause()
    }
    document.addEventListener('visibilitychange', pauseWhenHidden)
    return () => {
      document.removeEventListener('visibilitychange', pauseWhenHidden)
      player.dispose()
    }
  }, [player])

  const reset = () => {
    player.stop()
    store?.getState().reset()
  }

  return {
    scenario,
    store,
    player,
    status,
    reset,
    isPlaying: status === PLAYER_STATUS.playing,
  }
}
