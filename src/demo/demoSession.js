import { createStore } from 'zustand/vanilla'

// A model is { group, createInitialState, reduce }. Scenarios that share a group share one store,
// so a guest action on one slide is visible to the hotel-admin view on another.
export function createScenarioStore(model) {
  return createStore((set) => ({
    state: model.createInitialState(),
    dispatch: (action) =>
      set((current) => ({ state: model.reduce(current.state, action) })),
    reset: () => set({ state: model.createInitialState() }),
    // Reopens a saved demo view (pinned comments); unknown keys fall back to initial values.
    restore: (snapshot) =>
      set({ state: { ...model.createInitialState(), ...snapshot } }),
  }))
}

// Lives for one visit to a deck; leaving the deck drops every demo store.
export function createDemoSession() {
  const stores = new Map()

  return {
    getStore(model) {
      if (!stores.has(model.group))
        stores.set(model.group, createScenarioStore(model))
      return stores.get(model.group)
    },
  }
}
