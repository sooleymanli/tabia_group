import {
  AlarmClock,
  BedDouble,
  BellOff,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CarFront,
  CarTaxiFront,
  ChefHat,
  CircleUserRound,
  CreditCard,
  DoorClosed,
  DoorOpen,
  Flower2,
  Gem,
  HandCoins,
  History,
  KeyRound,
  LogOut,
  Luggage,
  MapPinned,
  MessageCircle,
  MessagesSquare,
  Music,
  PackageSearch,
  ReceiptText,
  Shirt,
  Sparkles,
  Star,
  UsersRound,
  UtensilsCrossed,
  Wrench,
} from 'lucide-react'

// Every guest-facing MVP module (README 7, Appendix A); the services tab lists them by group.
// `restaurant` and `spa` have no group: on the services tab the real venues below replace them.
export const SERVICE_GROUPS = ['stay', 'room', 'transport', 'more']

export const SERVICES = [
  { id: 'reservation', group: 'stay', icon: CalendarCheck },
  { id: 'checkin', group: 'stay', icon: DoorOpen },
  { id: 'stay', group: 'stay', icon: CalendarClock },
  { id: 'checkout', group: 'stay', icon: DoorClosed },
  { id: 'roomService', group: 'room', icon: UtensilsCrossed },
  { id: 'housekeeping', group: 'room', icon: Sparkles },
  { id: 'amenities', group: 'room', icon: BedDouble },
  { id: 'dnd', group: 'room', icon: BellOff },
  { id: 'laundry', group: 'room', icon: Shirt },
  { id: 'wakeup', group: 'room', icon: AlarmClock },
  { id: 'maintenance', group: 'room', icon: Wrench },
  { id: 'restaurant', icon: ChefHat },
  { id: 'spa', icon: Flower2 },
  { id: 'transport', group: 'transport', icon: CarTaxiFront },
  { id: 'tours', group: 'transport', icon: MapPinned },
  { id: 'valet', group: 'transport', icon: CarFront },
  { id: 'luggage', group: 'transport', icon: Luggage },
  { id: 'chat', group: 'more', icon: MessagesSquare },
  { id: 'program', group: 'more', icon: CalendarDays },
  { id: 'bill', group: 'more', icon: ReceiptText },
  { id: 'tips', group: 'more', icon: HandCoins },
  { id: 'loyalty', group: 'more', icon: Gem },
  { id: 'family', group: 'more', icon: UsersRound },
  { id: 'feedback', group: 'more', icon: Star },
  { id: 'lostFound', group: 'more', icon: PackageSearch },
]

// Real Shamakhi Palace venues and photos (shamakhipalace.az: dining, spa, entertainment).
const PHOTOS = '/assets/demo/shamakhi'

export const VENUES = [
  { id: 'whiteDiamond', name: 'White Diamond', photo: 'white-diamond' },
  {
    id: 'sharadil',
    name: 'Sharadil Kebab & Steak House',
    photo: 'sharadil',
  },
  { id: 'lobby', name: 'Lobby Lounge & Bar', photo: 'lobby-lounge' },
  { id: 'poolBar', name: 'Pool Bar', photo: 'pool-bar' },
  { id: 'pub', name: 'B&B Pub', photo: 'bb-pub' },
  { id: 'pegasus', name: 'Pegasus', photo: 'pegasus' },
].map((venue) => ({
  ...venue,
  image: `${PHOTOS}/${venue.photo}.jpg`,
  metaKey: `venue.${venue.id}`,
}))

export const SPA_NAME = 'Nargiz SPA'

export const WELLNESS = [
  { id: 'massage', photo: 'massage' },
  { id: 'fitness', photo: 'fitness', meta: '24/7' },
  { id: 'indoorPool', photo: 'indoor-pool', metaKey: 'wellness.heated' },
].map((item) => ({
  ...item,
  image: `${PHOTOS}/${item.photo}.jpg`,
  labelKey: `wellness.${item.id}`,
}))

// Shown as information and hours (MVP 40, 51); booking them is a later phase (28, 29).
export const FUN_PREVIEW_COUNT = 6
export const FUN = [
  { id: 'bowling', photo: 'bowling' },
  { id: 'billiards', photo: 'billiards' },
  { id: 'tennis', photo: 'tennis' },
  { id: 'basketball', photo: 'basketball' },
  { id: 'football', photo: 'football' },
  { id: 'trapShooting', photo: 'trap-shooting' },
  { id: 'paintball', photo: 'paintball' },
  { id: 'waterPolo', photo: 'water-polo' },
  { id: 'aquaGym', photo: 'aqua-gym' },
  { id: 'playground', photo: 'playground' },
  { id: 'ponyFarm', photo: 'pony-farm' },
  { id: 'nightclub', photo: 'nightclub' },
].map((item) => ({
  ...item,
  image: `${PHOTOS}/${item.photo}.jpg`,
  labelKey: `fun.${item.id}`,
}))

export const HOME_SERVICE_IDS = [
  'roomService',
  'housekeeping',
  'spa',
  'restaurant',
  'transport',
  'chat',
  'bill',
  'program',
]

export const PROFILE_ITEMS = [
  { id: 'account', icon: CircleUserRound },
  { id: 'payments', icon: CreditCard },
  { id: 'history', icon: History },
]

// Everything that opens the "details on other slides" note: services, two tabs, profile rows.
export const NOTES = {
  ...Object.fromEntries(
    SERVICES.map(({ id, icon }) => [
      id,
      { icon, labelKey: `service.${id}`, textKey: 'service.moreOnSlides' },
    ]),
  ),
  orders: { icon: ReceiptText, labelKey: 'tab.orders' },
  chatTab: { icon: MessageCircle, labelKey: 'tab.chat' },
  ...Object.fromEntries(
    PROFILE_ITEMS.map(({ id, icon }) => [
      id,
      { icon, labelKey: `profile.${id}` },
    ]),
  ),
  logout: { icon: LogOut, labelKey: 'profile.logout' },
  ...Object.fromEntries(
    VENUES.map(({ id, name, image }) => [
      id,
      { icon: ChefHat, label: name, image },
    ]),
  ),
  ...Object.fromEntries(
    [...WELLNESS, ...FUN].map(({ id, labelKey, image }) => [
      id,
      { icon: Star, labelKey, image },
    ]),
  ),
}

// Tabs that open their note on arrival; the screen behind stays the empty state.
export const TAB_NOTES = { orders: 'orders', chat: 'chatTab' }

// Sample notifications for MVP features (IDs in README Appendix A), newest first.
export const NOTIFICATIONS = [
  { id: 'order', icon: UtensilsCrossed, time: ['minutesAgo', 2], day: 'today' },
  {
    id: 'housekeeping',
    icon: Sparkles,
    time: ['minutesAgo', 35],
    day: 'today',
  },
  { id: 'spa', icon: Flower2, time: ['hoursAgo', 1], day: 'today' },
  { id: 'chat', icon: MessagesSquare, time: ['hoursAgo', 2], day: 'today' },
  { id: 'music', icon: Music, time: ['hoursAgo', 3], day: 'today' },
  { id: 'points', icon: Gem, time: ['yesterday'], day: 'earlier' },
  { id: 'feedback', icon: Star, time: ['yesterday'], day: 'earlier' },
  { id: 'roomReady', icon: KeyRound, time: ['daysAgo', 3], day: 'earlier' },
]

export const UNREAD_NOTIFICATIONS = 3

export const PROGRAM = [
  { id: 'yoga', time: '08:00' },
  { id: 'cooking', time: '15:00' },
  { id: 'music', time: '20:30' },
]

// Demo stay of the on-screen guest; matches room 412 used across the other slides.
// Hotel, room category and photo come from the client (Shamakhi Palace website).
export const DEMO_STAY = {
  guestName: 'Ramilə',
  hotel: 'SHAMAKHI PALACE SHARADIL',
  roomType: 'Grand Deluxe King',
  room: '412',
  checkoutDate: '25.10',
  checkoutTime: '12:00',
  nightsLeft: 3,
  points: 1250,
  image: '/assets/demo/places/shamakhi-palace-room.jpg',
}
