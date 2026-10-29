// Autoplay uses the same actions as a tap; `target` drives the touch indicator.
const step = (id, delayMs, target, action) => ({ id, delayMs, target, action })
const tabStep = (tab, delayMs, target = `tab-${tab}`) =>
  step(`tab-${tab}`, delayMs, target, { type: 'selectTab', tab })
const closeNote = (id, delayMs) =>
  step(id, delayMs, 'note-close', { type: 'closeNote' })

export const guestHomeSteps = [
  step('open-notifications', 1800, 'open-notifications', {
    type: 'openNotifications',
  }),
  step('close-notifications', 3200, 'notifications-back', {
    type: 'closeNotifications',
  }),
  step('open-room-service', 1400, 'service-roomService', {
    type: 'openNote',
    noteId: 'roomService',
  }),
  closeNote('close-room-service', 2400),
  tabStep('services', 1200, 'see-all-services'),
  tabStep('orders', 2400),
  closeNote('close-orders-note', 2200),
  tabStep('chat', 1400),
  closeNote('close-chat-note', 2200),
  tabStep('profile', 1400),
  tabStep('home', 2600),
]
