import { describe, expect, it } from 'vitest'
import { createDemoSession } from '@/demo/demoSession'
import { foodOrderScenario } from '@/modules/hotel-services/food'
import {
  ORDER_STATUS,
  createInitialState,
  reduce,
  selectActiveOrder,
} from '@/modules/hotel-services/food/foodOrderModel'
import { hotelAdminScenario } from '.'
import { hotelAdminSteps } from './hotelAdminSteps'
import { boardColumns, orderGuest, orderLines, orderPlace } from './orderBoard'

const columnOf = (state, orderId) =>
  boardColumns(state.orders).find((column) =>
    column.orders.some((order) => order.id === orderId),
  )?.id

describe('hotel panel orders', () => {
  it('starts with other rooms in the queue but nothing from the demo guest', () => {
    const columns = boardColumns(createInitialState().orders)
    expect(columns.map((column) => column.orders.length)).toEqual([0, 2, 1])
    expect(
      columns.flatMap((column) => column.orders).every((o) => !orderGuest(o)),
    ).toBe(true)
  })

  it('shows the guest order and moves it through the columns as the guest sees it', () => {
    let state = hotelAdminSteps
      .slice(0, 7)
      .map((step) => step.action)
      .reduce(reduce, createInitialState())
    const id = state.activeOrderId
    const order = selectActiveOrder(state)
    expect(columnOf(state, id)).toBe('new')
    expect(orderGuest(order)).toBe('Otaq 412 qonağı')
    expect(orderPlace(order)).toBe('Otaq 412')
    expect(orderLines(order)).toEqual(['1× Marqarita pizza'])

    for (const step of hotelAdminSteps.slice(7)) {
      state = reduce(state, step.action)
      // The phone reads the same object the panel shows.
      expect(selectActiveOrder(state).status).toBe(
        state.orders.find((o) => o.id === id).status,
      )
    }
    expect(columnOf(state, id)).toBe('closed')
    expect(selectActiveOrder(state)).toMatchObject({
      status: ORDER_STATUS.delivered,
      delays: 1,
    })
    expect(state.roomCharges).toEqual([
      { orderId: id, amount: 14, at: selectActiveOrder(state).deliveredAt },
    ])
  })

  it('every autoplay step changes state', () => {
    let state = createInitialState()
    for (const step of hotelAdminSteps) {
      const next = reduce(state, step.action)
      expect(next, step.id).not.toBe(state)
      state = next
    }
  })

  it('shares one store with the food-order slide', () => {
    const session = createDemoSession()
    const guestStore = session.getStore(foodOrderScenario.model)
    expect(session.getStore(hotelAdminScenario.model)).toBe(guestStore)
  })
})
