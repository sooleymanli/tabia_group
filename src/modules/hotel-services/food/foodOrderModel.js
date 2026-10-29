import { getLocation, getMenuItem } from './menuData'

export const SCREENS = {
  menu: 'menu',
  item: 'item',
  cart: 'cart',
  location: 'location',
  review: 'review',
  tracking: 'tracking',
}

export const ORDER_STATUS = {
  sent: 'sent',
  accepted: 'accepted',
  preparing: 'preparing',
  delivered: 'delivered',
  rejected: 'rejected',
}

export const REJECT_REASONS = ['unavailable', 'kitchenClosed', 'location']
export const ETA_CHOICES = [15, 25, 40]
export const DELAY_MINUTES = 10
// The demo guest whose phone is on screen; other orders belong to other rooms.
export const GUEST_ROOM = '412'

const MAX_QTY = 10
const FIRST_ORDER_NUMBER = 1042
// Demo clock (minutes since midnight) keeps timestamps identical between manual and autoplay runs.
const DEMO_START_MINUTES = 12 * 60 + 10
const ETA_MINUTES = 25

const STEP_BACK = {
  [SCREENS.item]: SCREENS.menu,
  [SCREENS.cart]: SCREENS.menu,
  [SCREENS.location]: SCREENS.cart,
  [SCREENS.review]: SCREENS.location,
  [SCREENS.tracking]: SCREENS.menu,
}

export function lineIdFor(itemId, options) {
  return options.length ? `${itemId}|${[...options].sort().join('+')}` : itemId
}

export function linePrice(line) {
  return (getMenuItem(line.itemId)?.price ?? 0) * line.qty
}

export function cartTotal(cart) {
  return roundMoney(cart.reduce((sum, line) => sum + linePrice(line), 0))
}

export function cartCount(cart) {
  return cart.reduce((sum, line) => sum + line.qty, 0)
}

function roundMoney(value) {
  return Math.round(value * 100) / 100
}

const at = (h, m) => h * 60 + m
const line = (itemId, qty) => ({ lineId: itemId, itemId, qty, options: [] })

function seedOrder({ number, place, lines, ...rest }) {
  return {
    id: `order-${number}`,
    number,
    guest: 'other',
    place,
    department: 'restaurant',
    lines,
    total: cartTotal(lines),
    locationId: null,
    locationVia: null,
    acceptedAt: null,
    etaAt: null,
    startedAt: null,
    deliveredAt: null,
    rejectedAt: null,
    rejectReason: null,
    delays: 0,
    feedback: { rating: 0, tags: [], submitted: false },
    ...rest,
  }
}

// Requests from other (fictional, demo) rooms, so the hotel panel shows a realistic queue.
function seedOrders() {
  return [
    seedOrder({
      number: 1039,
      place: 'Otaq 305',
      lines: [line('caesar', 1), line('lemonade', 2)],
      status: ORDER_STATUS.delivered,
      placedAt: at(11, 20),
      acceptedAt: at(11, 21),
      etaAt: at(11, 46),
      startedAt: at(11, 24),
      deliveredAt: at(11, 42),
      feedback: { rating: 4, tags: ['tasty'], submitted: true },
    }),
    seedOrder({
      number: 1040,
      place: 'Otaq 218',
      lines: [line('pizza', 2)],
      status: ORDER_STATUS.preparing,
      placedAt: at(11, 48),
      acceptedAt: at(11, 49),
      etaAt: at(12, 14),
      startedAt: at(11, 52),
    }),
    seedOrder({
      number: 1041,
      place: 'Hovuz, şezlonq A3',
      lines: [line('orangeJuice', 2), line('cheesecake', 1)],
      status: ORDER_STATUS.accepted,
      placedAt: at(12, 2),
      acceptedAt: at(12, 3),
      etaAt: at(12, 28),
    }),
  ]
}

export function createInitialState() {
  return {
    screen: SCREENS.menu,
    direction: 1,
    categoryId: 'all',
    itemId: null,
    draft: { qty: 1, options: [] },
    cart: [],
    removed: null,
    locationId: null,
    locationVia: null,
    qrScanning: false,
    orders: seedOrders(),
    activeOrderId: null,
    nextOrderNumber: FIRST_ORDER_NUMBER,
    clock: DEMO_START_MINUTES,
    roomCharges: [],
  }
}

function navigate(state, screen, direction = 1) {
  return { ...state, screen, direction, qrScanning: false, removed: null }
}

function updateOrder(state, orderId, from, patch) {
  const order = state.orders.find((entry) => entry.id === orderId)
  // Hotel-side transitions only move forward one step; repeated or out-of-order taps are ignored.
  if (!order || order.status !== from) return state
  return {
    ...state,
    orders: state.orders.map((entry) =>
      entry.id === orderId ? { ...entry, ...patch } : entry,
    ),
  }
}

export function reduce(state, action) {
  switch (action.type) {
    case 'selectCategory':
      return { ...state, categoryId: action.categoryId }

    case 'openItem':
      if (!getMenuItem(action.itemId)) return state
      return {
        ...navigate(state, SCREENS.item),
        itemId: action.itemId,
        draft: { qty: 1, options: [] },
      }

    case 'toggleOption': {
      const item = getMenuItem(state.itemId)
      if (
        state.screen !== SCREENS.item ||
        !item?.options.includes(action.optionId)
      )
        return state
      const options = state.draft.options.includes(action.optionId)
        ? state.draft.options.filter((id) => id !== action.optionId)
        : [...state.draft.options, action.optionId]
      return { ...state, draft: { ...state.draft, options } }
    }

    case 'setDraftQty': {
      const qty = Math.min(MAX_QTY, Math.max(1, action.qty))
      return { ...state, draft: { ...state.draft, qty } }
    }

    case 'addToCart': {
      if (state.screen !== SCREENS.item || !state.itemId) return state
      const lineId = lineIdFor(state.itemId, state.draft.options)
      const existing = state.cart.find((line) => line.lineId === lineId)
      const cart = existing
        ? state.cart.map((line) =>
            line.lineId === lineId
              ? { ...line, qty: Math.min(MAX_QTY, line.qty + state.draft.qty) }
              : line,
          )
        : [
            ...state.cart,
            {
              lineId,
              itemId: state.itemId,
              qty: state.draft.qty,
              options: [...state.draft.options].sort(),
            },
          ]
      return { ...navigate(state, SCREENS.menu, -1), cart }
    }

    case 'quickAdd': {
      if (!getMenuItem(action.itemId)) return state
      const lineId = lineIdFor(action.itemId, [])
      const existing = state.cart.find((line) => line.lineId === lineId)
      const cart = existing
        ? state.cart.map((line) =>
            line.lineId === lineId
              ? { ...line, qty: Math.min(MAX_QTY, line.qty + 1) }
              : line,
          )
        : [
            ...state.cart,
            { lineId, itemId: action.itemId, qty: 1, options: [] },
          ]
      return { ...state, cart, removed: null }
    }

    case 'changeLineQty': {
      const line = state.cart.find((entry) => entry.lineId === action.lineId)
      if (!line) return state
      const qty = Math.min(MAX_QTY, line.qty + action.delta)
      if (qty <= 0) {
        const index = state.cart.indexOf(line)
        return {
          ...state,
          cart: state.cart.filter((entry) => entry !== line),
          removed: { line, index },
        }
      }
      return {
        ...state,
        removed: null,
        cart: state.cart.map((entry) =>
          entry === line ? { ...entry, qty } : entry,
        ),
      }
    }

    case 'undoRemove': {
      if (!state.removed) return state
      const cart = [...state.cart]
      cart.splice(state.removed.index, 0, state.removed.line)
      return { ...state, cart, removed: null }
    }

    case 'openCart':
      return navigate(state, SCREENS.cart)

    case 'openLocation':
      if (!state.cart.length) return state
      return navigate(state, SCREENS.location)

    case 'chooseLocation':
      if (!getLocation(action.locationId)) return state
      return {
        ...state,
        locationId: action.locationId,
        locationVia: 'manual',
        qrScanning: false,
      }

    case 'startQrScan':
      if (state.screen !== SCREENS.location) return state
      return { ...state, qrScanning: true }

    case 'completeQrScan':
      if (!state.qrScanning || !getLocation(action.locationId)) return state
      return {
        ...state,
        locationId: action.locationId,
        locationVia: 'qr',
        qrScanning: false,
      }

    case 'cancelQrScan':
      return { ...state, qrScanning: false }

    case 'openReview':
      if (!state.cart.length || !state.locationId) return state
      return navigate(state, SCREENS.review)

    case 'placeOrder': {
      // An empty cart means the order was already sent, so a double tap cannot create a duplicate.
      if (
        state.screen !== SCREENS.review ||
        !state.cart.length ||
        !state.locationId
      )
        return state
      const id = `order-${state.nextOrderNumber}`
      const order = {
        id,
        number: state.nextOrderNumber,
        guest: 'self',
        place: null,
        department: 'restaurant',
        lines: state.cart,
        total: cartTotal(state.cart),
        locationId: state.locationId,
        locationVia: state.locationVia,
        status: ORDER_STATUS.sent,
        placedAt: state.clock,
        acceptedAt: null,
        etaAt: null,
        startedAt: null,
        deliveredAt: null,
        rejectedAt: null,
        rejectReason: null,
        delays: 0,
        feedback: { rating: 0, tags: [], submitted: false },
      }
      return {
        ...navigate(state, SCREENS.tracking),
        cart: [],
        orders: [...state.orders, order],
        activeOrderId: id,
        nextOrderNumber: state.nextOrderNumber + 1,
      }
    }

    case 'hotelAccept': {
      const order = state.orders.find((entry) => entry.id === action.orderId)
      const acceptedAt = (order?.placedAt ?? state.clock) + 1
      const eta = ETA_CHOICES.includes(action.etaMinutes)
        ? action.etaMinutes
        : ETA_MINUTES
      return updateOrder(state, action.orderId, ORDER_STATUS.sent, {
        status: ORDER_STATUS.accepted,
        acceptedAt,
        etaAt: acceptedAt + eta,
      })
    }

    case 'hotelReject': {
      if (!REJECT_REASONS.includes(action.reason)) return state
      const order = state.orders.find((entry) => entry.id === action.orderId)
      return updateOrder(state, action.orderId, ORDER_STATUS.sent, {
        status: ORDER_STATUS.rejected,
        rejectedAt: (order?.placedAt ?? state.clock) + 1,
        rejectReason: action.reason,
      })
    }

    case 'hotelDelay': {
      const order = state.orders.find((entry) => entry.id === action.orderId)
      if (
        !order ||
        (order.status !== ORDER_STATUS.accepted &&
          order.status !== ORDER_STATUS.preparing)
      )
        return state
      return updateOrder(state, action.orderId, order.status, {
        etaAt: order.etaAt + DELAY_MINUTES,
        delays: order.delays + 1,
      })
    }

    case 'hotelStart': {
      const order = state.orders.find((entry) => entry.id === action.orderId)
      return updateOrder(state, action.orderId, ORDER_STATUS.accepted, {
        status: ORDER_STATUS.preparing,
        startedAt: (order?.acceptedAt ?? state.clock) + 3,
      })
    }

    case 'hotelDeliver': {
      const order = state.orders.find((entry) => entry.id === action.orderId)
      const next = updateOrder(state, action.orderId, ORDER_STATUS.preparing, {
        status: ORDER_STATUS.delivered,
        deliveredAt: (order?.etaAt ?? state.clock) - 2,
      })
      if (next === state) return state
      // Only the on-screen guest's bill is tracked in this demo.
      if (order.guest !== 'self') return next
      return {
        ...next,
        roomCharges: [
          ...next.roomCharges,
          {
            orderId: order.id,
            amount: order.total,
            at: (order.etaAt ?? state.clock) - 2,
          },
        ],
      }
    }

    case 'rateOrder':
      return updateFeedback(state, action.orderId, (feedback) => ({
        ...feedback,
        rating: Math.min(5, Math.max(1, action.rating)),
      }))

    case 'toggleFeedbackTag':
      return updateFeedback(state, action.orderId, (feedback) => ({
        ...feedback,
        tags: feedback.tags.includes(action.tag)
          ? feedback.tags.filter((tag) => tag !== action.tag)
          : [...feedback.tags, action.tag],
      }))

    case 'submitFeedback':
      return updateFeedback(state, action.orderId, (feedback) =>
        feedback.rating ? { ...feedback, submitted: true } : feedback,
      )

    case 'back': {
      const previous = STEP_BACK[state.screen]
      return previous ? navigate(state, previous, -1) : state
    }

    case 'newOrder':
      return navigate(state, SCREENS.menu, -1)

    default:
      return state
  }
}

function updateFeedback(state, orderId, update) {
  const order = state.orders.find((entry) => entry.id === orderId)
  if (
    !order ||
    order.status !== ORDER_STATUS.delivered ||
    order.feedback.submitted
  )
    return state
  return {
    ...state,
    orders: state.orders.map((entry) =>
      entry === order ? { ...entry, feedback: update(entry.feedback) } : entry,
    ),
  }
}

export function selectActiveOrder(state) {
  return state.orders.find((order) => order.id === state.activeOrderId) ?? null
}

export function selectGuestOrders(state) {
  return state.orders.filter((order) => order.guest === 'self')
}

export function formatClock(minutes) {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Identifies what the phone shows; pinned comments only appear on the view they were placed on.
export function viewKey(state) {
  switch (state.screen) {
    case SCREENS.item:
      return `item:${state.itemId}`
    case SCREENS.location:
      return state.qrScanning ? 'location:qr' : 'location'
    default:
      return state.screen
  }
}

export const foodOrderModel = {
  group: 'service-orders',
  createInitialState,
  reduce,
  viewKey,
}
