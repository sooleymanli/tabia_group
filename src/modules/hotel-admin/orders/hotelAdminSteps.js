// Slide "hotel-admin": a short guest order on the phone, then the restaurant handles it on the
// panel. Same actions as manual taps; admin targets live inside the hotel panel frame.
const ORDER_ID = 'order-1042'

export const hotelAdminSteps = [
  {
    id: 'open-pizza',
    delayMs: 900,
    target: 'menu-item-pizza',
    action: { type: 'openItem', itemId: 'pizza' },
  },
  {
    id: 'add-pizza',
    delayMs: 900,
    target: 'add-to-cart',
    action: { type: 'addToCart' },
  },
  {
    id: 'open-cart',
    delayMs: 900,
    target: 'cart-bar',
    action: { type: 'openCart' },
  },
  {
    id: 'to-location',
    delayMs: 900,
    target: 'to-location',
    action: { type: 'openLocation' },
  },
  {
    id: 'room',
    delayMs: 900,
    target: 'location-room-412',
    action: { type: 'chooseLocation', locationId: 'room-412' },
  },
  {
    id: 'to-review',
    delayMs: 900,
    target: 'to-review',
    action: { type: 'openReview' },
  },
  {
    id: 'place',
    delayMs: 1000,
    target: 'place-order',
    action: { type: 'placeOrder' },
  },
  {
    id: 'accept',
    delayMs: 1800,
    target: 'admin-accept-1042',
    action: { type: 'hotelAccept', orderId: ORDER_ID, etaMinutes: 25 },
  },
  {
    id: 'start',
    delayMs: 1800,
    target: 'admin-start-1042',
    action: { type: 'hotelStart', orderId: ORDER_ID },
  },
  {
    id: 'delay',
    delayMs: 1800,
    target: 'admin-delay-1042',
    action: { type: 'hotelDelay', orderId: ORDER_ID },
  },
  {
    id: 'deliver',
    delayMs: 2000,
    target: 'admin-deliver-1042',
    action: { type: 'hotelDeliver', orderId: ORDER_ID },
  },
]
