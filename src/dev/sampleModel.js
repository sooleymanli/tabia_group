// Dev-only data for /_dev/guest-kit; exercises the demo engine without a real hotel scenario.
export const SAMPLE_ITEMS = [
  {
    id: 'tea',
    price: 6,
    name: { az: 'Çay dəsti', en: 'Tea set', ru: 'Чайный набор' },
  },
  {
    id: 'salad',
    price: 14.5,
    name: { az: 'Mövsüm salatı', en: 'Seasonal salad', ru: 'Сезонный салат' },
  },
  {
    id: 'lemonade',
    price: 7,
    name: { az: 'Limonad', en: 'Lemonade', ru: 'Лимонад' },
  },
]

export const sampleModel = {
  group: 'dev-sample',
  createInitialState: () => ({
    screen: 'home',
    direction: 1,
    itemId: null,
    cart: {},
    sheetOpen: false,
    tab: 'home',
  }),
  reduce(state, action) {
    switch (action.type) {
      case 'openItem':
        return { ...state, screen: 'item', direction: 1, itemId: action.itemId }
      case 'back':
        return { ...state, screen: 'home', direction: -1 }
      case 'add':
        return {
          ...state,
          cart: {
            ...state.cart,
            [action.itemId]: (state.cart[action.itemId] ?? 0) + 1,
          },
        }
      case 'sheet':
        return { ...state, sheetOpen: action.open }
      case 'tab':
        return { ...state, tab: action.tab }
      default:
        return state
    }
  },
}

export const sampleSteps = [
  {
    id: 'open-salad',
    delayMs: 700,
    target: 'item-salad',
    action: { type: 'openItem', itemId: 'salad' },
  },
  {
    id: 'add-1',
    delayMs: 900,
    target: 'add',
    action: { type: 'add', itemId: 'salad' },
  },
  {
    id: 'add-2',
    delayMs: 700,
    target: 'add',
    action: { type: 'add', itemId: 'salad' },
  },
  { id: 'back', delayMs: 800, target: 'back', action: { type: 'back' } },
  {
    id: 'cart',
    delayMs: 800,
    target: 'cart',
    action: { type: 'sheet', open: true },
  },
  { id: 'close', delayMs: 1400, action: { type: 'sheet', open: false } },
]

export function sampleCartTotal(cart) {
  return SAMPLE_ITEMS.reduce(
    (sum, item) => sum + (cart[item.id] ?? 0) * item.price,
    0,
  )
}
