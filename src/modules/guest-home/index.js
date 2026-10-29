import { GuestHomePhone } from './GuestHomePhone'
import { guestHomeModel } from './guestHomeModel'
import { guestHomeSteps } from './guestHomeSteps'

export const guestHomeScenario = {
  id: 'overview',
  model: guestHomeModel,
  steps: guestHomeSteps,
  Phone: GuestHomePhone,
}
