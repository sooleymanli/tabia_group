-- Tabia Guest presentation: PIN access, viewer feedback and analytics (README section 24).
-- Clients never touch tables directly: every read/write goes through the functions below, which
-- validate the caller's PIN session. Tables only expose rows to admins through RLS.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- HMAC key for PINs, generated inside the database so it never appears in the repository.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'tabia_pin_pepper') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'tabia_pin_pepper',
      'HMAC key for Tabia presentation PINs'
    );
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.access_pins (
  id uuid primary key default gen_random_uuid(),
  -- HMAC of the 4-digit PIN; the plain PIN is shown to the admin once and never stored.
  pin_hash text not null,
  label text not null check (char_length(btrim(label)) between 1 and 120),
  note text check (note is null or char_length(note) <= 500),
  is_active boolean not null default true,
  expires_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  deactivated_at timestamptz
);
create unique index access_pins_active_hash on public.access_pins (pin_hash) where is_active;

create table public.viewer_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  pin_id uuid not null references public.access_pins (id) on delete cascade,
  visibility text not null default 'vendor' check (visibility in ('public', 'vendor')),
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index viewer_sessions_pin on public.viewer_sessions (pin_id);

create table public.pin_attempts (
  id bigint generated always as identity primary key,
  user_id uuid,
  succeeded boolean not null,
  created_at timestamptz not null default now()
);
create index pin_attempts_user on public.pin_attempts (user_id, created_at);
create index pin_attempts_failed on public.pin_attempts (created_at) where not succeeded;

create table public.slide_events (
  id uuid primary key,
  session_id uuid not null references public.viewer_sessions (id) on delete cascade,
  deck_id text not null check (deck_id ~ '^[a-z0-9-]{1,40}$'),
  slide_id text not null check (slide_id ~ '^[a-z0-9-]{1,60}$'),
  content_version integer not null default 1 check (content_version between 1 and 1000),
  event_type text not null check (event_type in ('view', 'active_time', 'demo_play', 'demo_complete')),
  duration_ms integer check (duration_ms is null or duration_ms between 0 and 3600000),
  created_at timestamptz not null default now()
);
create index slide_events_slide on public.slide_events (deck_id, slide_id);
create index slide_events_session on public.slide_events (session_id);

create table public.slide_reactions (
  session_id uuid not null references public.viewer_sessions (id) on delete cascade,
  deck_id text not null check (deck_id ~ '^[a-z0-9-]{1,40}$'),
  slide_id text not null check (slide_id ~ '^[a-z0-9-]{1,60}$'),
  -- '' targets the whole slide; otherwise a stable feature or idea id.
  target_id text not null default '' check (target_id ~ '^[a-z0-9-]{0,60}$'),
  kind text not null check (kind in ('like', 'priority')),
  value text not null check (
    (kind = 'like' and value in ('like', 'dislike'))
    or (kind = 'priority' and value in ('important', 'not_needed'))
  ),
  visibility text not null check (visibility in ('public', 'vendor')),
  content_version integer not null default 1 check (content_version between 1 and 1000),
  updated_at timestamptz not null default now(),
  primary key (session_id, deck_id, slide_id, target_id, kind)
);
create index slide_reactions_slide on public.slide_reactions (deck_id, slide_id);

create table public.slide_comments (
  id uuid primary key,
  session_id uuid not null references public.viewer_sessions (id) on delete cascade,
  deck_id text not null check (deck_id ~ '^[a-z0-9-]{1,40}$'),
  slide_id text not null check (slide_id ~ '^[a-z0-9-]{1,60}$'),
  content_version integer not null default 1 check (content_version between 1 and 1000),
  kind text not null check (kind in ('comment', 'suggestion', 'question')),
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  -- Snapshot of the name the viewer typed at the time; later name changes do not rewrite it.
  author_name text check (author_name is null or char_length(author_name) between 1 and 80),
  visibility text not null check (visibility in ('public', 'vendor')),
  status text not null default 'new' check (status in ('new', 'reviewed', 'resolved')),
  is_hidden boolean not null default false,
  moderated_by uuid references auth.users (id) on delete set null,
  moderated_at timestamptz,
  created_at timestamptz not null default now()
);
create index slide_comments_slide on public.slide_comments (deck_id, slide_id, created_at);

-- ---------------------------------------------------------------------------
-- Private helpers (not exposed through the API)
-- ---------------------------------------------------------------------------

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- The caller's session, only while the session and its PIN are both still valid.
create function private.current_session()
returns public.viewer_sessions
language sql
stable
security definer
set search_path = ''
as $$
  select s.*
  from public.viewer_sessions s
  join public.access_pins p on p.id = s.pin_id
  where s.user_id = auth.uid()
    and s.expires_at > now()
    and p.is_active
    and (p.expires_at is null or p.expires_at > now());
$$;

create function private.require_session()
returns public.viewer_sessions
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_session public.viewer_sessions;
begin
  v_session := private.current_session();
  if v_session.id is null then
    raise exception 'no_session' using errcode = 'P0001';
  end if;
  return v_session;
end;
$$;

create function private.pin_hash(p_pin text)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_pepper text;
begin
  select decrypted_secret into v_pepper
  from vault.decrypted_secrets
  where name = 'tabia_pin_pepper';
  if v_pepper is null then
    raise exception 'pin_pepper_missing';
  end if;
  return encode(extensions.hmac(p_pin, v_pepper, 'sha256'), 'hex');
end;
$$;

create function private.require_admin()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
end;
$$;

revoke all on all functions in schema private from public;
grant execute on function private.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Row level security: clients get nothing directly; admins may read everything.
-- ---------------------------------------------------------------------------

alter table public.admins enable row level security;
alter table public.access_pins enable row level security;
alter table public.viewer_sessions enable row level security;
alter table public.pin_attempts enable row level security;
alter table public.slide_events enable row level security;
alter table public.slide_reactions enable row level security;
alter table public.slide_comments enable row level security;

create policy admins_read_admins on public.admins for select to authenticated
  using ((select private.is_admin()));
create policy admins_read_pins on public.access_pins for select to authenticated
  using ((select private.is_admin()));
create policy admins_read_sessions on public.viewer_sessions for select to authenticated
  using ((select private.is_admin()));
create policy admins_read_attempts on public.pin_attempts for select to authenticated
  using ((select private.is_admin()));
create policy admins_read_events on public.slide_events for select to authenticated
  using ((select private.is_admin()));
create policy admins_read_reactions on public.slide_reactions for select to authenticated
  using ((select private.is_admin()));
create policy admins_read_comments on public.slide_comments for select to authenticated
  using ((select private.is_admin()));

revoke all on public.admins, public.access_pins, public.viewer_sessions, public.pin_attempts,
  public.slide_events, public.slide_reactions, public.slide_comments from anon, authenticated;
-- pin_hash stays unreadable even for admins through the API.
grant select (id, label, note, is_active, expires_at, created_by, created_at, deactivated_at)
  on public.access_pins to authenticated;
grant select on public.admins, public.viewer_sessions, public.pin_attempts, public.slide_events,
  public.slide_reactions, public.slide_comments to authenticated;

-- ---------------------------------------------------------------------------
-- Viewer API
-- ---------------------------------------------------------------------------

create function public.redeem_pin(p_pin text, p_visibility text default 'vendor')
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_pin public.access_pins;
  v_session public.viewer_sessions;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;
  if private.is_admin() then
    -- Admin previews are never recorded as viewer sessions.
    return jsonb_build_object('ok', false, 'error', 'admin_preview');
  end if;
  if p_visibility not in ('public', 'vendor') then
    return jsonb_build_object('ok', false, 'error', 'invalid_visibility');
  end if;

  -- Serialise attempts per user so parallel requests cannot bypass the limit.
  perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));

  if (
    select count(*) from public.pin_attempts
    where user_id = v_uid and not succeeded and created_at > now() - interval '15 minutes'
  ) >= 5 then
    return jsonb_build_object('ok', false, 'error', 'too_many_attempts');
  end if;
  -- Circuit breaker against guessing spread across many anonymous users.
  if (
    select count(*) from public.pin_attempts
    where not succeeded and created_at > now() - interval '10 minutes'
  ) >= 200 then
    return jsonb_build_object('ok', false, 'error', 'temporarily_locked');
  end if;

  if p_pin is not null and p_pin ~ '^[0-9]{4}$' then
    select * into v_pin
    from public.access_pins
    where pin_hash = private.pin_hash(p_pin)
      and is_active
      and (expires_at is null or expires_at > now());
  end if;

  if v_pin.id is null then
    insert into public.pin_attempts (user_id, succeeded) values (v_uid, false);
    return jsonb_build_object('ok', false, 'error', 'invalid_pin');
  end if;

  insert into public.pin_attempts (user_id, succeeded) values (v_uid, true);
  insert into public.viewer_sessions as s (user_id, pin_id, visibility, expires_at)
  values (
    v_uid,
    v_pin.id,
    p_visibility,
    least(coalesce(v_pin.expires_at, 'infinity'::timestamptz), now() + interval '30 days')
  )
  on conflict (user_id) do update
    set pin_id = excluded.pin_id,
        visibility = excluded.visibility,
        started_at = now(),
        last_seen_at = now(),
        expires_at = excluded.expires_at
  returning * into v_session;

  return jsonb_build_object(
    'ok', true,
    'session_id', v_session.id,
    'visibility', v_session.visibility,
    'expires_at', v_session.expires_at
  );
end;
$$;

create function public.get_my_session()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.viewer_sessions := private.current_session();
begin
  if v_session.id is null then
    return null;
  end if;
  update public.viewer_sessions set last_seen_at = now() where id = v_session.id;
  return jsonb_build_object(
    'session_id', v_session.id,
    'visibility', v_session.visibility,
    'expires_at', v_session.expires_at
  );
end;
$$;

create function public.set_feedback_visibility(p_visibility text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.viewer_sessions := private.require_session();
begin
  if p_visibility not in ('public', 'vendor') then
    raise exception 'invalid_visibility' using errcode = 'P0001';
  end if;
  -- Applies to new feedback only; earlier comments keep the visibility they were written with.
  update public.viewer_sessions set visibility = p_visibility where id = v_session.id;
  return p_visibility;
end;
$$;

create function public.end_my_session()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.viewer_sessions where user_id = auth.uid();
$$;

create function public.submit_comment(
  p_id uuid,
  p_deck_id text,
  p_slide_id text,
  p_kind text,
  p_body text,
  p_author_name text default null,
  p_content_version integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.viewer_sessions := private.require_session();
  v_name text := nullif(btrim(p_author_name), '');
  v_row public.slide_comments;
begin
  insert into public.slide_comments
    (id, session_id, deck_id, slide_id, content_version, kind, body, author_name, visibility)
  values
    (p_id, v_session.id, p_deck_id, p_slide_id, p_content_version, p_kind, btrim(p_body), v_name,
     v_session.visibility)
  -- A retry with the same client id is a no-op, so flaky networks cannot duplicate a comment.
  on conflict (id) do nothing;

  select * into v_row from public.slide_comments where id = p_id and session_id = v_session.id;
  if v_row.id is null then
    raise exception 'comment_conflict' using errcode = 'P0001';
  end if;
  return jsonb_build_object('id', v_row.id, 'visibility', v_row.visibility, 'created_at', v_row.created_at);
end;
$$;

create function public.set_reaction(
  p_deck_id text,
  p_slide_id text,
  p_kind text,
  p_value text,
  p_target_id text default '',
  p_content_version integer default 1
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.viewer_sessions := private.require_session();
begin
  if p_value is null then
    delete from public.slide_reactions
    where session_id = v_session.id and deck_id = p_deck_id and slide_id = p_slide_id
      and target_id = coalesce(p_target_id, '') and kind = p_kind;
    return null;
  end if;

  insert into public.slide_reactions
    (session_id, deck_id, slide_id, target_id, kind, value, visibility, content_version)
  values
    (v_session.id, p_deck_id, p_slide_id, coalesce(p_target_id, ''), p_kind, p_value,
     v_session.visibility, p_content_version)
  on conflict (session_id, deck_id, slide_id, target_id, kind) do update
    set value = excluded.value,
        visibility = excluded.visibility,
        content_version = excluded.content_version,
        updated_at = now();
  return p_value;
end;
$$;

create function public.record_slide_event(
  p_id uuid,
  p_deck_id text,
  p_slide_id text,
  p_event_type text,
  p_duration_ms integer default null,
  p_content_version integer default 1
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.viewer_sessions := private.require_session();
begin
  insert into public.slide_events (id, session_id, deck_id, slide_id, content_version, event_type, duration_ms)
  values (p_id, v_session.id, p_deck_id, p_slide_id, p_content_version, p_event_type, p_duration_ms)
  on conflict (id) do nothing;
end;
$$;

-- Safe projection for viewers: no session, user or PIN identifiers ever leave the database.
create function public.list_slide_comments(p_deck_id text, p_slide_id text)
returns table (
  id uuid,
  kind text,
  body text,
  author_name text,
  created_at timestamptz,
  is_own boolean,
  visibility text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_session public.viewer_sessions := private.require_session();
begin
  return query
  select c.id, c.kind, c.body, c.author_name, c.created_at,
         c.session_id = v_session.id,
         case when c.session_id = v_session.id then c.visibility end
  from public.slide_comments c
  where c.deck_id = p_deck_id
    and c.slide_id = p_slide_id
    and (c.session_id = v_session.id or (c.visibility = 'public' and not c.is_hidden))
  order by c.created_at;
end;
$$;

create function public.my_reactions(p_deck_id text)
returns table (slide_id text, target_id text, kind text, value text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_session public.viewer_sessions := private.require_session();
begin
  return query
  select r.slide_id, r.target_id, r.kind, r.value
  from public.slide_reactions r
  where r.session_id = v_session.id and r.deck_id = p_deck_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin API
-- ---------------------------------------------------------------------------

create function public.admin_create_pin(
  p_label text,
  p_note text default null,
  p_expires_at timestamptz default null,
  p_pin text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pin text := p_pin;
  v_id uuid;
  v_try integer := 0;
begin
  perform private.require_admin();
  if p_expires_at is not null and p_expires_at <= now() then
    raise exception 'expires_in_past' using errcode = 'P0001';
  end if;

  if v_pin is not null then
    if v_pin !~ '^[0-9]{4}$' then
      raise exception 'invalid_pin_format' using errcode = 'P0001';
    end if;
    if exists (select 1 from public.access_pins where is_active and pin_hash = private.pin_hash(v_pin)) then
      raise exception 'pin_in_use' using errcode = 'P0001';
    end if;
  else
    loop
      v_try := v_try + 1;
      v_pin := lpad(
        (abs(('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::int) % 10000)::text,
        4, '0'
      );
      exit when not exists (
        select 1 from public.access_pins where is_active and pin_hash = private.pin_hash(v_pin)
      );
      if v_try >= 50 then
        raise exception 'no_free_pin' using errcode = 'P0001';
      end if;
    end loop;
  end if;

  insert into public.access_pins (pin_hash, label, note, expires_at, created_by)
  values (private.pin_hash(v_pin), btrim(p_label), nullif(btrim(p_note), ''), p_expires_at, auth.uid())
  returning id into v_id;

  -- The only moment the plain PIN is available; the admin must copy it now.
  return jsonb_build_object('id', v_id, 'pin', v_pin);
end;
$$;

create function public.admin_set_pin_active(p_pin_id uuid, p_active boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_admin();
  -- Reactivation fails on the unique index if another active PIN took the same code meanwhile.
  update public.access_pins
  set is_active = p_active,
      deactivated_at = case when p_active then null else now() end
  where id = p_pin_id;
end;
$$;

create function public.admin_moderate_comment(p_comment_id uuid, p_status text, p_hidden boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_admin();
  update public.slide_comments
  set status = coalesce(p_status, status),
      is_hidden = coalesce(p_hidden, is_hidden),
      moderated_by = auth.uid(),
      moderated_at = now()
  where id = p_comment_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin views (security_invoker: base-table RLS limits them to admins)
-- ---------------------------------------------------------------------------

create view public.admin_pin_overview with (security_invoker = true) as
select
  p.id,
  p.label,
  p.is_active,
  p.expires_at,
  p.created_at,
  count(distinct s.id) as sessions,
  max(s.last_seen_at) as last_seen_at,
  (select count(*) from public.slide_events e
     join public.viewer_sessions es on es.id = e.session_id
   where es.pin_id = p.id and e.event_type = 'view') as slide_views,
  (select count(*) from public.slide_comments c
     join public.viewer_sessions cs on cs.id = c.session_id
   where cs.pin_id = p.id) as comments
from public.access_pins p
left join public.viewer_sessions s on s.pin_id = p.id
group by p.id;

create view public.admin_slide_stats with (security_invoker = true) as
with slides as (
  select deck_id, slide_id from public.slide_events
  union select deck_id, slide_id from public.slide_reactions
  union select deck_id, slide_id from public.slide_comments
)
select
  sl.deck_id,
  sl.slide_id,
  (select count(*) from public.slide_events e
   where e.deck_id = sl.deck_id and e.slide_id = sl.slide_id and e.event_type = 'view') as views,
  (select count(distinct e.session_id) from public.slide_events e
   where e.deck_id = sl.deck_id and e.slide_id = sl.slide_id and e.event_type = 'view') as viewing_sessions,
  (select coalesce(sum(e.duration_ms), 0) from public.slide_events e
   where e.deck_id = sl.deck_id and e.slide_id = sl.slide_id and e.event_type = 'active_time') as active_ms,
  (select count(*) from public.slide_reactions r
   where r.deck_id = sl.deck_id and r.slide_id = sl.slide_id and r.kind = 'like' and r.value = 'like') as likes,
  (select count(*) from public.slide_reactions r
   where r.deck_id = sl.deck_id and r.slide_id = sl.slide_id and r.kind = 'like' and r.value = 'dislike') as dislikes,
  (select count(*) from public.slide_reactions r
   where r.deck_id = sl.deck_id and r.slide_id = sl.slide_id and r.kind = 'priority' and r.value = 'important') as important,
  (select count(*) from public.slide_reactions r
   where r.deck_id = sl.deck_id and r.slide_id = sl.slide_id and r.kind = 'priority' and r.value = 'not_needed') as not_needed,
  (select count(*) from public.slide_comments c
   where c.deck_id = sl.deck_id and c.slide_id = sl.slide_id) as comments
from slides sl;

revoke all on public.admin_pin_overview, public.admin_slide_stats from anon, authenticated;
grant select on public.admin_pin_overview, public.admin_slide_stats to authenticated;

-- ---------------------------------------------------------------------------
-- Function privileges: only signed-in callers (anonymous viewers included) may call the API.
-- ---------------------------------------------------------------------------

revoke all on function
  public.redeem_pin(text, text),
  public.get_my_session(),
  public.set_feedback_visibility(text),
  public.end_my_session(),
  public.submit_comment(uuid, text, text, text, text, text, integer),
  public.set_reaction(text, text, text, text, text, integer),
  public.record_slide_event(uuid, text, text, text, integer, integer),
  public.list_slide_comments(text, text),
  public.my_reactions(text),
  public.admin_create_pin(text, text, timestamptz, text),
  public.admin_set_pin_active(uuid, boolean),
  public.admin_moderate_comment(uuid, text, boolean)
from public, anon;

grant execute on function
  public.redeem_pin(text, text),
  public.get_my_session(),
  public.set_feedback_visibility(text),
  public.end_my_session(),
  public.submit_comment(uuid, text, text, text, text, text, integer),
  public.set_reaction(text, text, text, text, text, integer),
  public.record_slide_event(uuid, text, text, text, integer, integer),
  public.list_slide_comments(text, text),
  public.my_reactions(text),
  public.admin_create_pin(text, text, timestamptz, text),
  public.admin_set_pin_active(uuid, boolean),
  public.admin_moderate_comment(uuid, text, boolean)
to authenticated;
