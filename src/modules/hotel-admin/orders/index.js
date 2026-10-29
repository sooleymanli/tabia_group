import { FoodOrderPhone } from '@/modules/hotel-services/food/FoodOrderPhone'
import { foodOrderModel } from '@/modules/hotel-services/food/foodOrderModel'
import { hotelAdminSteps } from './hotelAdminSteps'
import { OrdersBoard } from './OrdersBoard'

// Shares the "service-orders" store with the food-order slide: an order placed there shows up here.
export const hotelAdminScenario = {
  id: 'hotel-admin',
  model: foodOrderModel,
  steps: hotelAdminSteps,
  Phone: FoodOrderPhone,
  Admin: OrdersBoard,
}
