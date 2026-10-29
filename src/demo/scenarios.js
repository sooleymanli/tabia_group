import { guestHomeScenario } from '@/modules/guest-home'
import { hotelAdminScenario } from '@/modules/hotel-admin/orders'
import { foodOrderScenario } from '@/modules/hotel-services/food'

// Keyed by slide id; slides without an entry show the placeholder.
const SCENARIOS = {
  [guestHomeScenario.id]: guestHomeScenario,
  [foodOrderScenario.id]: foodOrderScenario,
  [hotelAdminScenario.id]: hotelAdminScenario,
}

export function getScenario(slideId) {
  return slideId ? SCENARIOS[slideId] : undefined
}
