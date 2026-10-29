-- Developer Team replies to viewer comments, the demo state behind a pinned comment, and admin
-- read APIs for the /admin panel and the in-slide admin preview.

-- What the phone/admin demo showed when the pin was placed, so selecting it can reopen that view.
alter table public.slide_comments
  add column anchor_context jsonb check (
    anchor_context is null
    or (jsonb_typeof(anchor_context) = 'object' and pg_column_size(anchor_context) <= 8192)
  ),
  add constraint slide_comments_context_needs_anchor check (
    anchor_context is null or anchor_area is not null
  );

create table public.comment_replies (
  id uuid primary key,
  comment_id uuid not null references public.slide_comments (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  -- 'public': everyone who can see the comment; 'pin': only sessions of the comment author's PIN.
  visibility text not null check (visibility in ('public', 'pin')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index comment_replies_comment on public.comment_replies (comment_id, created_at);

alter table public.comment_replies enable row level security;
create policy admins_read_replies on public.comment_replies for select to authenticated
  using ((select private.is_admin()));
revoke all on public.comment_replies from anon, authenticated;
grant select on public.comment_replies to authenticated;

-- ---------------------------------------------------------------------------
-- Viewer API
-- ---------------------------------------------------------------------------

drop function public.submit_comment(uuid, text, text, text, text, text, integer, text, real, real);

create function public.submit_comment(
  p_id uuid,
  p_deck_id text,
  p_slide_id text,
  p_kind text,
  p_body text,
  p_author_name text default null,
  p_content_version integer default 1,
  p_anchor_area text default null,
  p_anchor_x real default null,
  p_anchor_y real default null,
  p_anchor_context jsonb default null
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
    (id, session_id, deck_id, slide_id, content_version, kind, body, author_name, visibility,
     anchor_area, anchor_x, anchor_y, anchor_context)
  values
    (p_id, v_session.id, p_deck_id, p_slide_id, p_content_version, p_kind, btrim(p_body), v_name,
     v_session.visibility, p_anchor_area, p_anchor_x, p_anchor_y, p_anchor_context)
  -- A retry with the same client id is a no-op, so flaky networks cannot duplicate a comment.
  on conflict (id) do nothing;

  select * into v_row from public.slide_comments where id = p_id and session_id = v_session.id;
  if v_row.id is null then
    raise exception 'comment_conflict' using errcode = 'P0001';
  end if;
  return jsonb_build_object('id', v_row.id, 'visibility', v_row.visibility, 'created_at', v_row.created_at);
end;
$$;

drop function public.list_slide_comments(text, text);

-- Safe projection for viewers: no session, user or PIN identifiers ever leave the database.
create function public.list_slide_comments(p_deck_id text, p_slide_id text)
returns table (
  id uuid,
  kind text,
  body text,
  author_name text,
  created_at timestamptz,
  is_own boolean,
  visibility text,
  anchor_area text,
  anchor_x real,
  anchor_y real,
  anchor_context jsonb,
  replies jsonb
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
         case when c.session_id = v_session.id then c.visibility end,
         c.anchor_area, c.anchor_x, c.anchor_y, c.anchor_context,
         coalesce((
           select jsonb_agg(
                    jsonb_build_object(
                      'id', r.id,
                      'body', r.body,
                      'created_at', r.created_at,
                      'private', r.visibility = 'pin'
                    ) order by r.created_at)
           from public.comment_replies r
           where r.comment_id = c.id
             and (r.visibility = 'public' or cs.pin_id = v_session.pin_id)
         ), '[]'::jsonb)
  from public.slide_comments c
  join public.viewer_sessions cs on cs.id = c.session_id
  where c.deck_id = p_deck_id
    and c.slide_id = p_slide_id
    and (c.session_id = v_session.id or (c.visibility = 'public' and not c.is_hidden))
  order by c.created_at;
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin API
-- ---------------------------------------------------------------------------

-- Every comment with its PIN label and all replies; optional deck/slide filter for the preview.
create function public.admin_list_comments(p_deck_id text default null, p_slide_id text default null)
returns table (
  id uuid,
  deck_id text,
  slide_id text,
  kind text,
  body text,
  author_name text,
  visibility text,
  status text,
  is_hidden boolean,
  created_at timestamptz,
  anchor_area text,
  anchor_x real,
  anchor_y real,
  anchor_context jsonb,
  pin_label text,
  replies jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.require_admin();
  return query
  select c.id, c.deck_id, c.slide_id, c.kind, c.body, c.author_name, c.visibility, c.status,
         c.is_hidden, c.created_at, c.anchor_area, c.anchor_x, c.anchor_y, c.anchor_context,
         p.label,
         coalesce((
           select jsonb_agg(
                    jsonb_build_object(
                      'id', r.id,
                      'body', r.body,
                      'created_at', r.created_at,
                      'visibility', r.visibility
                    ) order by r.created_at)
           from public.comment_replies r
           where r.comment_id = c.id
         ), '[]'::jsonb)
  from public.slide_comments c
  join public.viewer_sessions s on s.id = c.session_id
  join public.access_pins p on p.id = s.pin_id
  where (p_deck_id is null or c.deck_id = p_deck_id)
    and (p_slide_id is null or c.slide_id = p_slide_id)
  order by c.created_at desc;
end;
$$;

create function public.admin_reply(
  p_id uuid,
  p_comment_id uuid,
  p_body text,
  p_visibility text default 'public'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.comment_replies;
begin
  perform private.require_admin();
  if p_visibility not in ('public', 'pin') then
    raise exception 'invalid_visibility' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.slide_comments where id = p_comment_id) then
    raise exception 'comment_not_found' using errcode = 'P0001';
  end if;

  insert into public.comment_replies (id, comment_id, body, visibility, created_by)
  values (p_id, p_comment_id, btrim(p_body), p_visibility, auth.uid())
  -- Same client id on retry: no duplicate reply.
  on conflict (id) do nothing;

  select * into v_row from public.comment_replies where id = p_id and comment_id = p_comment_id;
  if v_row.id is null then
    raise exception 'reply_conflict' using errcode = 'P0001';
  end if;

  -- Answering a new comment marks it as seen.
  update public.slide_comments
  set status = 'reviewed', moderated_by = auth.uid(), moderated_at = now()
  where id = p_comment_id and status = 'new';

  return jsonb_build_object('id', v_row.id, 'created_at', v_row.created_at);
end;
$$;

create function public.admin_delete_reply(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_admin();
  delete from public.comment_replies where id = p_id;
end;
$$;

revoke all on function
  public.submit_comment(uuid, text, text, text, text, text, integer, text, real, real, jsonb),
  public.list_slide_comments(text, text),
  public.admin_list_comments(text, text),
  public.admin_reply(uuid, uuid, text, text),
  public.admin_delete_reply(uuid)
from public, anon;

grant execute on function
  public.submit_comment(uuid, text, text, text, text, text, integer, text, real, real, jsonb),
  public.list_slide_comments(text, text),
  public.admin_list_comments(text, text),
  public.admin_reply(uuid, uuid, text, text),
  public.admin_delete_reply(uuid)
to authenticated;
