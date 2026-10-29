// Ties a pinned comment to what the demo showed, so the pin reopens that view instead of
// floating over a different screen.
const MAX_STATE_CHARS = 6000

export function currentDemoView(scenario, state) {
  if (!scenario || !state) return null
  return scenario.model.viewKey?.(state) ?? null
}

export function captureDemoContext(scenario, state) {
  const view = currentDemoView(scenario, state)
  if (view === null) return null
  const json = JSON.stringify(state)
  return {
    scenario: scenario.id,
    view,
    ...(json.length <= MAX_STATE_CHARS && { state: JSON.parse(json) }),
  }
}

// Pins without context (or from another scenario) are shown on every view.
export function pinMatchesView(context, scenarioId, view) {
  if (!context?.view || context.scenario !== scenarioId) return true
  return context.view === view
}

export function canRestore(context, scenarioId) {
  return Boolean(context?.state) && context.scenario === scenarioId
}
