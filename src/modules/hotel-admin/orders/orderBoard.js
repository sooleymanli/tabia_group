import { pickText } from '@/guest-app/i18n'
import {
  GUEST_ROOM,
  ORDER_STATUS,
} from '@/modules/hotel-services/food/foodOrderModel'
import {
  getLocation,
  getMenuItem,
} from '@/modules/hotel-services/food/menuData'

// Hotel staff work in Azerbaijani; the guest app's languages do not apply to this panel.
export const STATUS_LABELS = {
  [ORDER_STATUS.sent]: 'Yeni',
  [ORDER_STATUS.accepted]: 'Qəbul edilib',
  [ORDER_STATUS.preparing]: 'İcradadır',
  [ORDER_STATUS.delivered]: 'Tamamlandı',
  [ORDER_STATUS.rejected]: 'Rədd edilib',
}

export const REJECT_LABELS = {
  unavailable: 'Məhsul yoxdur',
  kitchenClosed: 'Mətbəx bağlıdır',
  location: 'Bu yerə çatdırılmır',
}

export const DEPARTMENT_LABELS = { restaurant: 'Restoran' }

export const COLUMNS = [
  { id: 'new', title: 'Yeni', statuses: [ORDER_STATUS.sent] },
  {
    id: 'active',
    title: 'İcrada',
    statuses: [ORDER_STATUS.accepted, ORDER_STATUS.preparing],
  },
  {
    id: 'closed',
    title: 'Bağlanıb',
    statuses: [ORDER_STATUS.delivered, ORDER_STATUS.rejected],
  },
]

// Newest request on top in every column.
export function boardColumns(orders) {
  return COLUMNS.map((column) => ({
    ...column,
    orders: orders
      .filter((order) => column.statuses.includes(order.status))
      .toSorted((a, b) => b.number - a.number),
  }))
}

export function orderPlace(order) {
  const location = getLocation(order.locationId)
  return order.place ?? (location ? pickText(location.name, 'az') : '—')
}

// Only the on-screen guest is identified; other rooms are already named by their place.
export function orderGuest(order) {
  return order.guest === 'self' ? `Otaq ${GUEST_ROOM} qonağı` : null
}

export function orderLines(order) {
  return order.lines.map((line) => {
    const item = getMenuItem(line.itemId)
    return `${line.qty}× ${item ? pickText(item.name, 'az') : line.itemId}`
  })
}
