import { randomUUID } from 'node:crypto'
import { beforeAll, describe, expect, it } from 'vitest'
import { asUser, createTestDb, createUser, rpc } from './testDb'

let db
let admin
let viewerA
let viewerB
let pinA

const value = (rows, fn) => rows[0][fn]

async function redeem(user, pin, visibility = 'vendor') {
  return value(
    await rpc(db, user, 'redeem_pin', { p_pin: pin, p_visibility: visibility }),
    'redeem_pin',
  )
}

async function comment(user, body, extra = {}) {
  const id = randomUUID()
  await rpc(db, user, 'submit_comment', {
    p_id: id,
    p_deck_id: 'mvp',
    p_slide_id: 'food-order',
    p_kind: 'comment',
    p_body: body,
    ...extra,
  })
  return id
}

async function visibleComments(user) {
  return rpc(db, user, 'list_slide_comments', {
    p_deck_id: 'mvp',
    p_slide_id: 'food-order',
  })
}

beforeAll(async () => {
  db = await createTestDb()
  admin = await createUser(db, { email: 'admin@tabia.test', anonymous: false })
  await db.query('insert into public.admins (user_id) values ($1)', [admin])
  viewerA = await createUser(db)
  viewerB = await createUser(db)

  const created = value(
    await rpc(db, admin, 'admin_create_pin', { p_label: 'Otel A' }),
    'admin_create_pin',
  )
  pinA = created.pin
  expect(pinA).toMatch(/^\d{4}$/)
}, 30_000)

describe('PIN access', () => {
  it('never stores the plain PIN', async () => {
    const { rows } = await db.query('select pin_hash from public.access_pins')
    expect(
      rows.every((row) => row.pin_hash !== pinA && row.pin_hash.length === 64),
    ).toBe(true)
  })

  it('only admins can create PINs', async () => {
    await expect(
      rpc(db, viewerA, 'admin_create_pin', { p_label: 'x' }),
    ).rejects.toThrow(/forbidden/)
    await expect(
      rpc(db, null, 'admin_create_pin', { p_label: 'x' }),
    ).rejects.toThrow(/permission denied/)
  })

  it('rejects a duplicate active PIN chosen by hand', async () => {
    await expect(
      rpc(db, admin, 'admin_create_pin', { p_label: 'Dup', p_pin: pinA }),
    ).rejects.toThrow(/pin_in_use/)
  })

  it('anon role cannot call the API or read tables', async () => {
    await expect(rpc(db, null, 'redeem_pin', { p_pin: pinA })).rejects.toThrow(
      /permission denied/,
    )
    await expect(
      asUser(db, null, 'select * from public.slide_comments'),
    ).rejects.toThrow(/permission denied/)
  })

  it('redeems a valid PIN and creates a session', async () => {
    const result = await redeem(viewerA, pinA, 'public')
    expect(result).toMatchObject({ ok: true, visibility: 'public' })
    expect(Object.keys(result).sort()).toEqual([
      'expires_at',
      'ok',
      'session_id',
      'visibility',
    ])
    expect(await redeem(viewerB, pinA, 'vendor')).toMatchObject({
      ok: true,
      visibility: 'vendor',
    })
  })

  it('does not let an admin become a viewer session', async () => {
    expect(await redeem(admin, pinA)).toEqual({
      ok: false,
      error: 'admin_preview',
    })
  })

  it('locks a user out after five wrong PINs, even if the sixth is right', async () => {
    const guesser = await createUser(db)
    const wrong = pinA === '0000' ? '1111' : '0000'
    for (let i = 0; i < 5; i += 1) {
      expect(await redeem(guesser, wrong)).toEqual({
        ok: false,
        error: 'invalid_pin',
      })
    }
    expect(await redeem(guesser, pinA)).toEqual({
      ok: false,
      error: 'too_many_attempts',
    })
  })

  it('treats malformed input as a wrong PIN', async () => {
    const user = await createUser(db)
    expect(await redeem(user, "1' or '1'='1")).toEqual({
      ok: false,
      error: 'invalid_pin',
    })
    expect(await redeem(user, '12345')).toEqual({
      ok: false,
      error: 'invalid_pin',
    })
  })
})

describe('feedback visibility', () => {
  it('shows public comments to other PIN sessions but never vendor-only ones', async () => {
    const publicId = await comment(viewerA, 'Çox gözəl', {
      p_author_name: 'Aysel',
    })
    const vendorId = await comment(viewerB, 'Yalnız Tabia görsün')

    const seenByA = await visibleComments(viewerA)
    expect(seenByA.map((c) => c.id)).toContain(publicId)
    expect(seenByA.map((c) => c.id)).not.toContain(vendorId)

    const seenByB = await visibleComments(viewerB)
    const own = seenByB.find((c) => c.id === vendorId)
    expect(own).toMatchObject({ is_own: true, visibility: 'vendor' })
    const other = seenByB.find((c) => c.id === publicId)
    expect(other).toMatchObject({
      is_own: false,
      visibility: null,
      author_name: 'Aysel',
    })
  })

  it('exposes no session, user or PIN identifiers to viewers', async () => {
    const [row] = await visibleComments(viewerA)
    expect(Object.keys(row).sort()).toEqual(
      [
        'anchor_area',
        'anchor_context',
        'anchor_x',
        'anchor_y',
        'author_name',
        'body',
        'created_at',
        'id',
        'is_own',
        'kind',
        'replies',
        'status',
        'visibility',
      ].sort(),
    )
  })

  it('blocks direct table access for viewers', async () => {
    expect(
      await asUser(db, viewerA, 'select * from public.slide_comments'),
    ).toEqual([])
    expect(
      await asUser(db, viewerA, 'select * from public.viewer_sessions'),
    ).toEqual([])
    await expect(
      asUser(db, viewerA, "update public.slide_comments set body = 'x'"),
    ).rejects.toThrow(/permission denied/)
    await expect(
      asUser(db, admin, 'select pin_hash from public.access_pins'),
    ).rejects.toThrow(/permission denied/)
  })

  it('applies a visibility change only to new comments', async () => {
    const before = await comment(viewerA, 'Əvvəlki public')
    await rpc(db, viewerA, 'set_feedback_visibility', {
      p_visibility: 'vendor',
    })
    const after = await comment(viewerA, 'Sonrakı vendor')
    const seenByB = (await visibleComments(viewerB)).map((c) => c.id)
    expect(seenByB).toContain(before)
    expect(seenByB).not.toContain(after)
    await rpc(db, viewerA, 'set_feedback_visibility', {
      p_visibility: 'public',
    })
  })

  it('validates comment length and slide ids on the server', async () => {
    await expect(comment(viewerA, 'x'.repeat(2001))).rejects.toThrow()
    await expect(comment(viewerA, '   ')).rejects.toThrow()
    await expect(
      comment(viewerA, 'ok', { p_slide_id: 'Bad Slide!' }),
    ).rejects.toThrow()
  })

  it('stores a pinned point and returns it to other sessions', async () => {
    const id = await comment(viewerA, 'Bu düymə kiçikdir', {
      p_anchor_area: 'phone',
      p_anchor_x: 0.25,
      p_anchor_y: 0.8,
    })
    const pinned = (await visibleComments(viewerB)).find((c) => c.id === id)
    expect(pinned).toMatchObject({ anchor_area: 'phone' })
    expect(pinned.anchor_x).toBeCloseTo(0.25)
    expect(pinned.anchor_y).toBeCloseTo(0.8)
  })

  it('rejects incomplete or out-of-range pins', async () => {
    await expect(
      comment(viewerA, 'x', { p_anchor_area: 'phone', p_anchor_x: 0.5 }),
    ).rejects.toThrow()
    await expect(
      comment(viewerA, 'x', {
        p_anchor_area: 'phone',
        p_anchor_x: 1.5,
        p_anchor_y: 0.5,
      }),
    ).rejects.toThrow()
    await expect(
      comment(viewerA, 'x', {
        p_anchor_area: 'elsewhere',
        p_anchor_x: 0.5,
        p_anchor_y: 0.5,
      }),
    ).rejects.toThrow()
  })
})

describe('dedupe and admin', () => {
  it('ignores retried comments, events and reactions', async () => {
    const id = randomUUID()
    const args = {
      p_id: id,
      p_deck_id: 'mvp',
      p_slide_id: 'chat',
      p_kind: 'question',
      p_body: 'Sual?',
    }
    await rpc(db, viewerA, 'submit_comment', args)
    await rpc(db, viewerA, 'submit_comment', args)
    const eventId = randomUUID()
    const event = {
      p_id: eventId,
      p_deck_id: 'mvp',
      p_slide_id: 'chat',
      p_event_type: 'view',
    }
    await rpc(db, viewerA, 'record_slide_event', event)
    await rpc(db, viewerA, 'record_slide_event', event)
    const reaction = {
      p_deck_id: 'mvp',
      p_slide_id: 'chat',
      p_kind: 'like',
      p_value: 'like',
    }
    await rpc(db, viewerA, 'set_reaction', reaction)
    await rpc(db, viewerA, 'set_reaction', { ...reaction, p_value: 'dislike' })

    const counts = await db.query(
      `select
         (select count(*) from public.slide_comments where id = $1)::int as comments,
         (select count(*) from public.slide_events where id = $2)::int as events,
         (select count(*) from public.slide_reactions where slide_id = 'chat')::int as reactions,
         (select value from public.slide_reactions where slide_id = 'chat') as value`,
      [id, eventId],
    )
    expect(counts.rows[0]).toEqual({
      comments: 1,
      events: 1,
      reactions: 1,
      value: 'dislike',
    })

    await rpc(db, viewerA, 'set_reaction', { ...reaction, p_value: null })
    expect(
      await rpc(db, viewerA, 'my_reactions', { p_deck_id: 'mvp' }),
    ).toEqual([])
  })

  it('does not record admin previews', async () => {
    await expect(
      rpc(db, admin, 'record_slide_event', {
        p_id: randomUUID(),
        p_deck_id: 'mvp',
        p_slide_id: 'chat',
        p_event_type: 'view',
      }),
    ).rejects.toThrow(/no_session/)
  })

  it('lets admins read everything, hide public comments and see stats', async () => {
    const all = await asUser(
      db,
      admin,
      'select id, visibility from public.slide_comments',
    )
    expect(all.some((c) => c.visibility === 'vendor')).toBe(true)

    const target = await comment(viewerA, 'Gizlədiləcək')
    await rpc(db, admin, 'admin_moderate_comment', {
      p_comment_id: target,
      p_status: 'reviewed',
      p_hidden: true,
    })
    expect((await visibleComments(viewerB)).map((c) => c.id)).not.toContain(
      target,
    )
    expect((await visibleComments(viewerA)).map((c) => c.id)).toContain(target)

    const [stats] = await asUser(
      db,
      admin,
      "select * from public.admin_slide_stats where slide_id = 'chat'",
    )
    expect(stats).toMatchObject({ views: 1, viewing_sessions: 1 })
    expect(
      await asUser(db, viewerA, 'select * from public.admin_slide_stats'),
    ).toEqual([])
  })

  it('revokes existing sessions when the PIN is deactivated', async () => {
    const [{ id: pinId }] = await asUser(
      db,
      admin,
      'select id from public.access_pins limit 1',
    )
    await rpc(db, admin, 'admin_set_pin_active', {
      p_pin_id: pinId,
      p_active: false,
    })

    expect(
      value(await rpc(db, viewerA, 'get_my_session'), 'get_my_session'),
    ).toBeNull()
    await expect(comment(viewerA, 'Bağlı PIN')).rejects.toThrow(/no_session/)
    expect(await redeem(await createUser(db), pinA)).toEqual({
      ok: false,
      error: 'invalid_pin',
    })

    await rpc(db, admin, 'admin_set_pin_active', {
      p_pin_id: pinId,
      p_active: true,
    })
    expect(
      value(await rpc(db, viewerA, 'get_my_session'), 'get_my_session'),
    ).not.toBeNull()
  })

  it('expired PINs stop working', async () => {
    const { pin, id } = value(
      await rpc(db, admin, 'admin_create_pin', {
        p_label: 'Qısa',
        p_expires_at: new Date(Date.now() + 60_000).toISOString(),
      }),
      'admin_create_pin',
    )
    const viewer = await createUser(db)
    expect(await redeem(viewer, pin)).toMatchObject({ ok: true })
    await db.query(
      "update public.access_pins set expires_at = now() - interval '1 second' where id = $1",
      [id],
    )
    expect(
      value(await rpc(db, viewer, 'get_my_session'), 'get_my_session'),
    ).toBeNull()
  })
})

describe('Developer Team replies and pin context', () => {
  let authorX
  let samePin
  let otherPin
  let commentId

  const newPin = async (label) =>
    value(
      await rpc(db, admin, 'admin_create_pin', { p_label: label }),
      'admin_create_pin',
    ).pin
  const repliesOf = async (user) =>
    (await visibleComments(user)).find((c) => c.id === commentId)?.replies
  const reply = (body, visibility) =>
    rpc(db, admin, 'admin_reply', {
      p_id: randomUUID(),
      p_comment_id: commentId,
      p_body: body,
      p_visibility: visibility,
    })

  beforeAll(async () => {
    const pinX = await newPin('Tabia X')
    const pinY = await newPin('Tabia Y')
    authorX = await createUser(db)
    samePin = await createUser(db)
    otherPin = await createUser(db)
    await redeem(authorX, pinX, 'public')
    await redeem(samePin, pinX)
    await redeem(otherPin, pinY)
    commentId = await comment(authorX, 'Bu ekran aydın deyil', {
      p_anchor_area: 'phone',
      p_anchor_x: 0.5,
      p_anchor_y: 0.5,
      p_anchor_context: { view: 'item:pizza', state: { screen: 'item' } },
    })
  })

  it('returns the stored demo context with the pin', async () => {
    const seen = (await visibleComments(otherPin)).find(
      (c) => c.id === commentId,
    )
    expect(seen.anchor_context).toEqual({
      view: 'item:pizza',
      state: { screen: 'item' },
    })
  })

  it('rejects oversized or pin-less context', async () => {
    await expect(
      comment(authorX, 'x', {
        p_anchor_area: 'phone',
        p_anchor_x: 0.1,
        p_anchor_y: 0.1,
        p_anchor_context: { blob: 'x'.repeat(10_000) },
      }),
    ).rejects.toThrow()
    await expect(
      comment(authorX, 'x', { p_anchor_context: { view: 'menu' } }),
    ).rejects.toThrow()
  })

  it('shows a public reply to everyone who sees the comment', async () => {
    await reply('Başa düşdük, düzəldəcəyik.', 'public')
    for (const user of [authorX, samePin, otherPin]) {
      expect((await repliesOf(user)).map((r) => r.body)).toContain(
        'Başa düşdük, düzəldəcəyik.',
      )
    }
  })

  it('shows a PIN-only reply just to sessions of the author PIN', async () => {
    await reply('Yalnız sizə: qiymət ayrıca göndəriləcək.', 'pin')
    const bodies = async (user) => (await repliesOf(user)).map((r) => r.body)
    expect(await bodies(authorX)).toContain(
      'Yalnız sizə: qiymət ayrıca göndəriləcək.',
    )
    expect(await bodies(samePin)).toContain(
      'Yalnız sizə: qiymət ayrıca göndəriləcək.',
    )
    expect(await bodies(otherPin)).not.toContain(
      'Yalnız sizə: qiymət ayrıca göndəriləcək.',
    )
  })

  it('lets only admins reply, list everything and read replies', async () => {
    await expect(
      rpc(db, authorX, 'admin_reply', {
        p_id: randomUUID(),
        p_comment_id: commentId,
        p_body: 'hack',
      }),
    ).rejects.toThrow(/forbidden/)
    await expect(rpc(db, authorX, 'admin_list_comments')).rejects.toThrow(
      /forbidden/,
    )
    expect(
      await asUser(db, authorX, 'select * from public.comment_replies'),
    ).toEqual([])

    const listed = (
      await rpc(db, admin, 'admin_list_comments', {
        p_deck_id: 'mvp',
        p_slide_id: 'food-order',
      })
    ).find((c) => c.id === commentId)
    expect(listed).toMatchObject({ pin_label: 'Tabia X', status: 'reviewed' })
    expect(listed.replies.map((r) => r.visibility)).toEqual(['public', 'pin'])
  })

  it('shows the resolved status to every viewer of the comment', async () => {
    await rpc(db, admin, 'admin_moderate_comment', {
      p_comment_id: commentId,
      p_status: 'resolved',
      p_hidden: null,
    })
    for (const user of [authorX, otherPin]) {
      const seen = (await visibleComments(user)).find((c) => c.id === commentId)
      expect(seen.status).toBe('resolved')
    }
  })

  it('does not duplicate a retried reply and can delete one', async () => {
    const id = randomUUID()
    const args = {
      p_id: id,
      p_comment_id: commentId,
      p_body: 'Təkrar',
      p_visibility: 'public',
    }
    await rpc(db, admin, 'admin_reply', args)
    await rpc(db, admin, 'admin_reply', args)
    expect(
      (await repliesOf(otherPin)).filter((r) => r.body === 'Təkrar'),
    ).toHaveLength(1)
    await rpc(db, admin, 'admin_delete_reply', { p_id: id })
    expect((await repliesOf(otherPin)).map((r) => r.id)).not.toContain(id)
  })
})
