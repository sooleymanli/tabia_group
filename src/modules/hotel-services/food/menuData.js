// Demo menu: prices are demo parameters, not a real hotel tariff (README 15).
// Photos: Unsplash License, stored locally; `photoId` is the unsplash.com/photos/<id> source.
// Text lives in the guest-app dictionaries (15 languages); `{ key }` points there.
const FOOD = '/assets/demo/food'
const PLACES = '/assets/demo/places'

const ref = (key) => ({ key })

export const CATEGORIES = ['all', 'mains', 'salads', 'drinks', 'desserts'].map(
  (id) => ({ id, name: ref(`menu.category.${id}`) }),
)

const OPTION_IDS = [
  'spicy',
  'noOnion',
  'noIce',
  'sauceSide',
  'noFries',
  'extraBasil',
]
const OPTIONS = Object.fromEntries(
  OPTION_IDS.map((id) => [id, ref(`menu.option.${id}`)]),
)

const item = (id, fields) => ({
  id,
  ...fields,
  name: ref(`menu.${id}.name`),
  description: ref(`menu.${id}.desc`),
})

export const MENU = [
  item('kebab', {
    categoryId: 'mains',
    price: 18,
    prepMinutes: 25,
    image: `${FOOD}/kebab.jpg`,
    photoId: '0gSpvtwdKuk',
    options: ['spicy', 'noOnion'],
  }),
  item('pizza', {
    categoryId: 'mains',
    price: 14,
    prepMinutes: 20,
    image: `${FOOD}/pizza.jpg`,
    photoId: 'qPorOVdCFzc',
    options: ['extraBasil'],
  }),
  item('sandwich', {
    categoryId: 'mains',
    price: 12,
    prepMinutes: 15,
    image: `${FOOD}/sandwich.jpg`,
    photoId: 'oBWEb-lAI60',
    options: ['noFries'],
  }),
  item('caesar', {
    categoryId: 'salads',
    price: 11.5,
    prepMinutes: 10,
    image: `${FOOD}/caesar.jpg`,
    photoId: 'FK-UKNip0pE',
    options: ['sauceSide'],
  }),
  item('orangeJuice', {
    categoryId: 'drinks',
    price: 6,
    prepMinutes: 5,
    image: `${FOOD}/orange-juice.jpg`,
    photoId: 'TmOGarNOGFs',
    options: ['noIce'],
  }),
  item('lemonade', {
    categoryId: 'drinks',
    price: 5.5,
    prepMinutes: 5,
    image: `${FOOD}/lemonade.jpg`,
    photoId: 'p5EiqkBYIEE',
    options: ['noIce'],
  }),
  item('cheesecake', {
    categoryId: 'desserts',
    price: 7.5,
    prepMinutes: 5,
    image: `${FOOD}/cheesecake.jpg`,
    photoId: 'uf9jCJRxNuk',
    options: [],
  }),
]

export const LOCATIONS = [
  {
    id: 'room-412',
    type: 'room',
    image: `${PLACES}/shamakhi-palace-room.jpg`,
    // Client photo from the Shamakhi Palace website, not Unsplash.
    source: 'client',
    name: ref('location.room412.name'),
    hint: ref('location.room412.hint'),
  },
  {
    id: 'pool-b7',
    type: 'pool',
    image: `${PLACES}/pool.jpg`,
    photoId: 'rcLq-DP-b2k',
    name: ref('location.poolB7.name'),
    hint: ref('location.poolB7.hint'),
  },
]

export function optionLabel(optionId) {
  return OPTIONS[optionId]
}

export function getMenuItem(itemId) {
  return MENU.find((entry) => entry.id === itemId)
}

export function getLocation(locationId) {
  return LOCATIONS.find((location) => location.id === locationId)
}
