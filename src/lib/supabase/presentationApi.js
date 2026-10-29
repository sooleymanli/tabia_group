import { supabase } from './client'

export class PresentationApiError extends Error {
  constructor(code, cause) {
    super(code)
    this.code = code
    this.cause = cause
  }
}

function requireClient() {
  if (!supabase) throw new PresentationApiError('not_configured')
  return supabase
}

// Server errors carry a short code (e.g. "no_session") as the message; map everything else to "network".
async function call(fn, args) {
  const { data, error } = await requireClient().rpc(fn, args)
  if (error) {
    const known = /^[a-z_]+$/.test(error.message ?? '')
      ? error.message
      : 'network'
    throw new PresentationApiError(known, error)
  }
  return data
}

export async function getCurrentUser() {
  const { data } = await requireClient().auth.getSession()
  return data.session?.user ?? null
}

// RLS only returns rows from `admins` to admins, so a non-admin always gets null here.
export async function isAdminUser(userId) {
  const { data, error } = await requireClient()
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new PresentationApiError('network', error)
  return data !== null
}

const AUTH_ERROR_CODES = new Set([
  'invalid_credentials',
  'email_not_confirmed',
  'over_request_rate_limit',
])

export async function signInWithPassword(email, password) {
  const { data, error } = await requireClient().auth.signInWithPassword({
    email,
    password,
  })
  if (error) {
    throw new PresentationApiError(
      AUTH_ERROR_CODES.has(error.code) ? error.code : 'auth_failed',
      error,
    )
  }
  return data.user
}

export async function signOut() {
  const { error } = await requireClient().auth.signOut()
  if (error) throw new PresentationApiError('network', error)
}

export async function ensureAnonymousUser() {
  const client = requireClient()
  const { data } = await client.auth.getSession()
  if (data.session) return data.session.user
  const { data: signedIn, error } = await client.auth.signInAnonymously()
  if (error) throw new PresentationApiError('auth_failed', error)
  return signedIn.user
}

export async function redeemPin(pin, visibility = 'vendor') {
  await ensureAnonymousUser()
  const result = await call('redeem_pin', {
    p_pin: pin,
    p_visibility: visibility,
  })
  if (!result?.ok)
    throw new PresentationApiError(result?.error ?? 'invalid_pin')
  return result
}

export const getMySession = () => call('get_my_session')
export const setFeedbackVisibility = (visibility) =>
  call('set_feedback_visibility', { p_visibility: visibility })
export const endMySession = () => call('end_my_session')

export function submitComment({
  id,
  deckId,
  slideId,
  kind,
  body,
  authorName,
  contentVersion = 1,
  anchor = null,
}) {
  return call('submit_comment', {
    p_id: id,
    p_deck_id: deckId,
    p_slide_id: slideId,
    p_kind: kind,
    p_body: body,
    p_author_name: authorName ?? null,
    p_content_version: contentVersion,
    ...(anchor && {
      p_anchor_area: anchor.area,
      p_anchor_x: anchor.x,
      p_anchor_y: anchor.y,
      p_anchor_context: anchor.context ?? null,
    }),
  })
}

export function setReaction({
  deckId,
  slideId,
  kind,
  value,
  targetId = '',
  contentVersion = 1,
}) {
  return call('set_reaction', {
    p_deck_id: deckId,
    p_slide_id: slideId,
    p_kind: kind,
    p_value: value,
    p_target_id: targetId,
    p_content_version: contentVersion,
  })
}

export function recordSlideEvent({
  id,
  deckId,
  slideId,
  type,
  durationMs = null,
  contentVersion = 1,
}) {
  return call('record_slide_event', {
    p_id: id,
    p_deck_id: deckId,
    p_slide_id: slideId,
    p_event_type: type,
    p_duration_ms: durationMs,
    p_content_version: contentVersion,
  })
}

export const listSlideComments = (deckId, slideId) =>
  call('list_slide_comments', { p_deck_id: deckId, p_slide_id: slideId })
export const myReactions = (deckId) =>
  call('my_reactions', { p_deck_id: deckId })

// Developer Team (admin) API: the server rejects every call from non-admins.

export const adminListComments = (deckId = null, slideId = null) =>
  call('admin_list_comments', { p_deck_id: deckId, p_slide_id: slideId })

export const adminReply = ({ id, commentId, body, visibility }) =>
  call('admin_reply', {
    p_id: id,
    p_comment_id: commentId,
    p_body: body,
    p_visibility: visibility,
  })

export const adminDeleteReply = (id) => call('admin_delete_reply', { p_id: id })

export const adminModerateComment = ({
  commentId,
  status = null,
  hidden = null,
}) =>
  call('admin_moderate_comment', {
    p_comment_id: commentId,
    p_status: status,
    p_hidden: hidden,
  })

export const adminCreatePin = ({ label, note = null, expiresAt = null }) =>
  call('admin_create_pin', {
    p_label: label,
    p_note: note,
    p_expires_at: expiresAt,
  })

export const adminSetPinActive = (pinId, active) =>
  call('admin_set_pin_active', { p_pin_id: pinId, p_active: active })

async function selectView(view, orderBy) {
  const { data, error } = await requireClient()
    .from(view)
    .select('*')
    .order(orderBy, { ascending: false })
  if (error) throw new PresentationApiError('network', error)
  return data
}

export const adminPinOverview = () =>
  selectView('admin_pin_overview', 'created_at')
export const adminSlideStats = () => selectView('admin_slide_stats', 'views')
