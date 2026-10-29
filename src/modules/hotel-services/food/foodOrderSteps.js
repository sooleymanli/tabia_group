// Autoplay script. Every action is the same one a manual tap dispatches; `target` points the
// touch indicator at the element marked data-demo-target.
const ORDER_ID = 'order-1042'

export const foodOrderSteps = [
  {
    id: 'open-kebab',
    delayMs: 900,
    target: 'menu-item-kebab',
    action: { type: 'openItem', itemId: 'kebab' },
  },
  {
    id: 'spicy',
    delayMs: 1100,
    target: 'option-spicy',
    action: { type: 'toggleOption', optionId: 'spicy' },
  },
  {
    id: 'qty-2',
    delayMs: 800,
    target: 'qty-plus',
    action: { type: 'setDraftQty', qty: 2 },
  },
  {
    id: 'add-kebab',
    delayMs: 900,
    target: 'add-to-cart',
    action: { type: 'addToCart' },
  },
  {
    id: 'drinks',
    delayMs: 1100,
    target: 'category-drinks',
    action: { type: 'selectCategory', categoryId: 'drinks' },
  },
  {
    id: 'open-lemonade',
    delayMs: 900,
    target: 'menu-item-lemonade',
    action: { type: 'openItem', itemId: 'lemonade' },
  },
  {
    id: 'add-lemonade',
    delayMs: 1000,
    target: 'add-to-cart',
    action: { type: 'addToCart' },
  },
  {
    id: 'open-cart',
    delayMs: 1000,
    target: 'cart-bar',
    action: { type: 'openCart' },
  },
  {
    id: 'lemonade-plus',
    delayMs: 1000,
    target: 'line-plus-lemonade',
    action: { type: 'changeLineQty', lineId: 'lemonade', delta: 1 },
  },
  {
    id: 'to-location',
    delayMs: 1000,
    target: 'to-location',
    action: { type: 'openLocation' },
  },
  {
    id: 'scan',
    delayMs: 1100,
    target: 'scan-qr',
    action: { type: 'startQrScan' },
  },
  {
    id: 'scanned',
    delayMs: 1800,
    action: { type: 'completeQrScan', locationId: 'pool-b7' },
  },
  {
    id: 'to-review',
    delayMs: 1200,
    target: 'to-review',
    action: { type: 'openReview' },
  },
  {
    id: 'place',
    delayMs: 1300,
    target: 'place-order',
    action: { type: 'placeOrder' },
  },
  {
    id: 'accept',
    delayMs: 1800,
    action: { type: 'hotelAccept', orderId: ORDER_ID },
  },
  {
    id: 'start',
    delayMs: 2000,
    action: { type: 'hotelStart', orderId: ORDER_ID },
  },
  {
    id: 'deliver',
    delayMs: 2200,
    action: { type: 'hotelDeliver', orderId: ORDER_ID },
  },
  {
    id: 'rate',
    delayMs: 1400,
    target: 'rate-5',
    action: { type: 'rateOrder', orderId: ORDER_ID, rating: 5 },
  },
  {
    id: 'tag',
    delayMs: 800,
    target: 'tag-onTime',
    action: { type: 'toggleFeedbackTag', orderId: ORDER_ID, tag: 'onTime' },
  },
  {
    id: 'send-feedback',
    delayMs: 900,
    target: 'feedback-submit',
    action: { type: 'submitFeedback', orderId: ORDER_ID },
  },
]
