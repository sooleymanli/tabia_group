import { describe, expect, it } from 'vitest'
import {
  createInitialState,
  foodOrderModel,
  reduce,
} from '@/modules/hotel-services/food/foodOrderModel'
import { createScenarioStore } from './demoSession'
import {
  canRestore,
  captureDemoContext,
  currentDemoView,
  pinMatchesView,
} from './demoContext'

const scenario = { id: 'food-order', model: foodOrderModel }

describe('demo context for pinned comments', () => {
  it('captures the open item and restores the exact state', () => {
    const state = reduce(createInitialState(), {
      type: 'openItem',
      itemId: 'pizza',
    })
    const context = captureDemoContext(scenario, state)
    expect(context).toMatchObject({
      scenario: 'food-order',
      view: 'item:pizza',
    })

    const store = createScenarioStore(foodOrderModel)
    expect(currentDemoView(scenario, store.getState().state)).toBe('menu')
    expect(canRestore(context, 'food-order')).toBe(true)
    store.getState().restore(context.state)
    expect(currentDemoView(scenario, store.getState().state)).toBe('item:pizza')
  })

  it('shows a pin only on the view it was placed on', () => {
    const context = { scenario: 'food-order', view: 'item:pizza' }
    expect(pinMatchesView(context, 'food-order', 'item:pizza')).toBe(true)
    expect(pinMatchesView(context, 'food-order', 'menu')).toBe(false)
    expect(pinMatchesView(null, 'food-order', 'menu')).toBe(true)
  })

  it('has no context for slides without a scenario', () => {
    expect(captureDemoContext(null, null)).toBeNull()
  })
})
