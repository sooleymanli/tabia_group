-- Pinned comments (Figma-style): an optional point on the slide, stored as fractions of a named
-- area so the pin stays on the same spot when the slide is scaled to another screen size.

alter table public.slide_comments
  add column anchor_area text check (anchor_area in ('content', 'phone', 'admin')),
  add column anchor_x real check (anchor_x between 0 and 1),
  add column anchor_y real check (anchor_y between 0 and 1),
  add constraint slide_comments_anchor_complete check (
    (anchor_area is null and anchor_x is null and anchor_y is null)
    or (anchor_area is not null and anchor_x is not null and anchor_y is not null)
  );

drop function public.submit_comment(uuid, text, text, text, text, text, integer);

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
  p_anchor_y real default null
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
     anchor_area, anchor_x, anchor_y)
  values
    (p_id, v_session.id, p_deck_id, p_slide_id, p_content_version, p_kind, btrim(p_body), v_name,
     v_session.visibility, p_anchor_area, p_anchor_x, p_anchor_y)
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
  anchor_y real
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
         c.anchor_area, c.anchor_x, c.anchor_y
  from public.slide_comments c
  where c.deck_id = p_deck_id
    and c.slide_id = p_slide_id
    and (c.session_id = v_session.id or (c.visibility = 'public' and not c.is_hidden))
  order by c.created_at;
end;
$$;

revoke all on function
  public.submit_comment(uuid, text, text, text, text, text, integer, text, real, real),
  public.list_slide_comments(text, text)
from public, anon;

grant execute on function
  public.submit_comment(uuid, text, text, text, text, text, integer, text, real, real),
  public.list_slide_comments(text, text)
to authenticated;
