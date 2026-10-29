import { createContext, use } from 'react'
import { useStore } from 'zustand'

export const ScenarioStoreContext = createContext(null)

function useScenarioStoreApi() {
  const store = use(ScenarioStoreContext)
  if (!store)
    throw new Error(
      'Scenario components must render inside ScenarioStoreContext',
    )
  return store
}

export function useScenarioState(selector) {
  return useStore(useScenarioStoreApi(), (value) => selector(value.state))
}

export function useScenarioDispatch() {
  return useStore(useScenarioStoreApi(), (value) => value.dispatch)
}
