-- Viewers see whether the Developer Team has reviewed or resolved a comment.

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
  status text,
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
         c.status,
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

revoke all on function public.list_slide_comments(text, text) from public, anon;
grant execute on function public.list_slide_comments(text, text) to authenticated;
