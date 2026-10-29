import { FoodOrderPhone } from './FoodOrderPhone'
import { foodOrderModel } from './foodOrderModel'
import { foodOrderSteps } from './foodOrderSteps'
import { HotelSidePanel } from './HotelSidePanel'

export const foodOrderScenario = {
  id: 'food-order',
  model: foodOrderModel,
  steps: foodOrderSteps,
  Phone: FoodOrderPhone,
  Aside: HotelSidePanel,
}
