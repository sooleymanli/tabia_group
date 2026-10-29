import { describe, expect, it, vi } from 'vitest'
import { createDemoPlayer } from '@/demo/createDemoPlayer'
import { createDemoSession } from '@/demo/demoSession'
import {
  DELAY_MINUTES,
  ORDER_STATUS,
  SCREENS,
  cartCount,
  cartTotal,
  createInitialState,
  foodOrderModel,
  reduce,
  selectActiveOrder,
  selectGuestOrders,
} from './foodOrderModel'
import { foodOrderSteps } from './foodOrderSteps'

const run = (actions, state = createInitialState()) =>
  actions.reduce(reduce, state)

const toReview = [
  { type: 'openItem', itemId: 'kebab' },
  { type: 'setDraftQty', qty: 2 },
  { type: 'addToCart' },
  { type: 'openCart' },
  { type: 'openLocation' },
  { type: 'chooseLocation', locationId: 'room-412' },
  { type: 'openReview' },
]

describe('food order model', () => {
  it('computes totals from quantity and menu price', () => {
    const state = run([
      { type: 'openItem', itemId: 'kebab' },
      { type: 'setDraftQty', qty: 2 },
      { type: 'addToCart' },
      { type: 'openItem', itemId: 'lemonade' },
      { type: 'addToCart' },
    ])
    expect(cartCount(state.cart)).toBe(3)
    expect(cartTotal(state.cart)).toBe(41.5)
  })

  it('merges identical lines and keeps different options apart', () => {
    const state = run([
      { type: 'openItem', itemId: 'lemonade' },
      { type: 'addToCart' },
      { type: 'quickAdd', itemId: 'lemonade' },
      { type: 'openItem', itemId: 'lemonade' },
      { type: 'toggleOption', optionId: 'noIce' },
      { type: 'addToCart' },
    ])
    expect(state.cart.map((line) => [line.lineId, line.qty])).toEqual([
      ['lemonade', 2],
      ['lemonade|noIce', 1],
    ])
  })

  it('ignores options that the item does not offer', () => {
    const state = run([
      { type: 'openItem', itemId: 'cheesecake' },
      { type: 'toggleOption', optionId: 'spicy' },
    ])
    expect(state.draft.options).toEqual([])
  })

  it('clamps quantity and supports removal with undo', () => {
    let state = run([
      { type: 'openItem', itemId: 'pizza' },
      { type: 'setDraftQty', qty: 99 },
    ])
    expect(state.draft.qty).toBe(10)
    state = run([{ type: 'setDraftQty', qty: 1 }, { type: 'addToCart' }], state)
    state = reduce(state, { type: 'changeLineQty', lineId: 'pizza', delta: -1 })
    expect(state.cart).toEqual([])
    state = reduce(state, { type: 'undoRemove' })
    expect(state.cart).toHaveLength(1)
    expect(state.removed).toBeNull()
  })

  it('does not leave the cart without items or a delivery location', () => {
    expect(reduce(createInitialState(), { type: 'openLocation' }).screen).toBe(
      SCREENS.menu,
    )
    const noLocation = run(toReview.slice(0, 5))
    expect(reduce(noLocation, { type: 'openReview' }).screen).toBe(
      SCREENS.location,
    )
  })

  it('creates exactly one order on a double tap', () => {
    const review = run(toReview)
    const once = reduce(review, { type: 'placeOrder' })
    const twice = reduce(once, { type: 'placeOrder' })
    expect(selectGuestOrders(twice)).toHaveLength(1)
    expect(twice).toBe(once)
    expect(selectActiveOrder(once)).toMatchObject({
      number: 1042,
      total: 36,
      status: ORDER_STATUS.sent,
      guest: 'self',
    })
    expect(once.cart).toEqual([])
  })

  it('moves the order forward only in sequence and charges the room once', () => {
    const placed = run([...toReview, { type: 'placeOrder' }])
    const id = placed.activeOrderId
    expect(reduce(placed, { type: 'hotelDeliver', orderId: id })).toBe(placed)

    const delivered = run(
      [
        { type: 'hotelAccept', orderId: id },
        { type: 'hotelStart', orderId: id },
        { type: 'hotelDeliver', orderId: id },
        { type: 'hotelDeliver', orderId: id },
      ],
      placed,
    )
    const order = selectActiveOrder(delivered)
    expect(order.status).toBe(ORDER_STATUS.delivered)
    expect(delivered.roomCharges).toEqual([
      { orderId: id, amount: 36, at: order.deliveredAt },
    ])
  })

  it('lets the hotel choose the ETA, reject with a reason and report delays', () => {
    const placed = run([...toReview, { type: 'placeOrder' }])
    const id = placed.activeOrderId

    const accepted = reduce(placed, {
      type: 'hotelAccept',
      orderId: id,
      etaMinutes: 40,
    })
    const order = selectActiveOrder(accepted)
    expect(order.etaAt - order.acceptedAt).toBe(40)

    const delayed = reduce(accepted, { type: 'hotelDelay', orderId: id })
    expect(selectActiveOrder(delayed)).toMatchObject({
      etaAt: order.etaAt + DELAY_MINUTES,
      delays: 1,
    })
    expect(reduce(placed, { type: 'hotelDelay', orderId: id })).toBe(placed)

    expect(
      reduce(placed, { type: 'hotelReject', orderId: id, reason: 'nope' }),
    ).toBe(placed)
    const rejected = reduce(placed, {
      type: 'hotelReject',
      orderId: id,
      reason: 'kitchenClosed',
    })
    expect(selectActiveOrder(rejected)).toMatchObject({
      status: ORDER_STATUS.rejected,
      rejectReason: 'kitchenClosed',
    })
    expect(reduce(rejected, { type: 'hotelAccept', orderId: id })).toBe(
      rejected,
    )
    expect(rejected.roomCharges).toEqual([])
  })

  it("never charges the demo guest for another room's order", () => {
    const state = run([
      { type: 'hotelStart', orderId: 'order-1041' },
      { type: 'hotelDeliver', orderId: 'order-1041' },
    ])
    expect(state.orders.find((order) => order.id === 'order-1041').status).toBe(
      ORDER_STATUS.delivered,
    )
    expect(state.roomCharges).toEqual([])
    expect(selectGuestOrders(state)).toEqual([])
  })

  it('accepts feedback only after delivery and only once', () => {
    const placed = run([...toReview, { type: 'placeOrder' }])
    const id = placed.activeOrderId
    expect(reduce(placed, { type: 'rateOrder', orderId: id, rating: 5 })).toBe(
      placed,
    )
  })
})

describe('food order autoplay', () => {
  it('ends in the same state as dispatching the steps by hand', () => {
    const manual = foodOrderSteps
      .map((step) => step.action)
      .reduce(reduce, createInitialState())

    const store = createDemoSession().getStore(foodOrderModel)
    vi.useFakeTimers()
    try {
      createDemoPlayer({
        steps: foodOrderSteps,
        run: (step) => store.getState().dispatch(step.action),
        reset: () => store.getState().reset(),
      }).play()
      vi.runAllTimers()
    } finally {
      vi.useRealTimers()
    }

    expect(store.getState().state).toEqual(manual)
    const [order] = selectGuestOrders(manual)
    expect(selectGuestOrders(manual)).toHaveLength(1)
    expect(order).toMatchObject({
      status: ORDER_STATUS.delivered,
      locationId: 'pool-b7',
      locationVia: 'qr',
    })
    expect(order.total).toBe(47)
    expect(order.feedback).toEqual({
      rating: 5,
      tags: ['onTime'],
      submitted: true,
    })
  })

  it('every step changes state, so no step is silently skipped', () => {
    let state = createInitialState()
    for (const step of foodOrderSteps) {
      const next = reduce(state, step.action)
      expect(next, step.id).not.toBe(state)
      state = next
    }
  })
})
