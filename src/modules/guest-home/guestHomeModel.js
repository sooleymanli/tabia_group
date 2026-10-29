import { NOTES, TAB_NOTES } from './homeData'

// Slide 1 (overview): the guest's home screen and its tabs. Separate group, so browsing the
// overview never changes another slide's demo.
export const HOME_TABS = ['home', 'services', 'orders', 'chat', 'profile']

export function createInitialState() {
  return {
    tab: 'home',
    noteId: null,
    notificationsOpen: false,
    notificationsRead: false,
    allFunShown: false,
  }
}

export function reduce(state, action) {
  switch (action.type) {
    case 'selectTab':
      return HOME_TABS.includes(action.tab) && action.tab !== state.tab
        ? {
            ...state,
            tab: action.tab,
            noteId: TAB_NOTES[action.tab] ?? null,
            notificationsOpen: false,
            allFunShown: false,
          }
        : state
    case 'toggleAllFun':
      return { ...state, allFunShown: !state.allFunShown }
    case 'openNote':
      return NOTES[action.noteId] ? { ...state, noteId: action.noteId } : state
    case 'closeNote':
      return state.noteId ? { ...state, noteId: null } : state
    case 'openNotifications':
      return { ...state, noteId: null, notificationsOpen: true }
    case 'closeNotifications':
      return state.notificationsOpen
        ? { ...state, notificationsOpen: false }
        : state
    case 'readNotifications':
      return state.notificationsRead
        ? state
        : { ...state, notificationsRead: true }
    default:
      return state
  }
}

export function viewKey(state) {
  if (state.notificationsOpen) return `${state.tab}:notifications`
  return state.noteId ? `${state.tab}:note:${state.noteId}` : state.tab
}

export const guestHomeModel = {
  group: 'guest-home',
  createInitialState,
  reduce,
  viewKey,
}
