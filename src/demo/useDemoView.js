import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'
import { currentDemoView } from './demoContext'

const NO_STORE = createStore(() => ({ state: null }))

export function useDemoView(runtime) {
  const state = useStore(runtime.store ?? NO_STORE, (store) => store.state)
  return currentDemoView(runtime.scenario, state)
}
