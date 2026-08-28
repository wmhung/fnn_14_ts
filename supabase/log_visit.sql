
-- ============================================================================
-- RPC: public.log_visit
-- Atomic "log a repeat visit": insert one visits row AND bump the placelist
-- counters in a single transaction, so the count can never drift.
--
-- Committed to the repo on purpose (lesson from toggle_bookmark): the function
-- body lives here, not only in the Supabase dashboard.
--
-- Called from data-service.ts:
--   supabase.rpc('log_visit', {
--     p_place_id, p_email, p_rating, p_note, p_visited_at
--   })
--
-- Trust model: same as the rest of FNN — the app has no Supabase Auth session,
-- so the *server action* (logVisit, which reads p_email from auth()) is the
-- trust boundary. The function still enforces ownership and rating range itself.
-- ============================================================================

-- Remove the old reward-era overload (it had a p_photo parameter). Leaving it
-- in place makes the function name ambiguous — Postgres can't choose between
-- the two signatures and returns "could not choose the best candidate function".
drop function if exists public.log_visit(bigint, text, timestamptz, text, text, integer);

create or replace function public.log_visit(
  p_place_id   bigint,
  p_email      text,
  p_rating     integer,
  p_note       text        default null,
  p_visited_at timestamptz default now()
)
returns table (visit_id bigint, visit_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_visit_id bigint;
  v_count    integer;
  v_when     timestamptz := coalesce(p_visited_at, now());
begin
  -- 1. Validate the rating (required, 1–5). Mirrors the DB CHECK + NOT NULL.
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'rating must be between 1 and 5'
      using errcode = '22023';  -- invalid_parameter_value
  end if;

  -- 2. Ownership guard — the place must belong to this user.
  if not exists (
    select 1 from public.placelist
     where id = p_place_id and email = p_email
  ) then
    raise exception 'place % not found or not owned by %', p_place_id, p_email
      using errcode = '42501';  -- insufficient_privilege
  end if;

  -- 3. Insert the visit (full history — one row per visit).
  insert into public.visits (email, place_id, visited_at, visit_rating, note)
  values (p_email, p_place_id, v_when, p_rating, p_note)
  returning id into v_visit_id;

  -- 4. Bump the denormalized counters in the SAME transaction.
  --    GREATEST(...) so backdating an old visit never moves last_visited_at
  --    backwards.
  --    NOTE: the table is aliased `pl` and every column is qualified, because
  --    the RETURNS TABLE output name `visit_count` is an in-scope variable and
  --    would otherwise be ambiguous with placelist.visit_count.
  update public.placelist pl
     set visit_count     = pl.visit_count + 1,
         last_visited_at = greatest(coalesce(pl.last_visited_at, to_timestamp(0)), v_when)
   where pl.id = p_place_id and pl.email = p_email
   returning pl.visit_count into v_count;

  return query select v_visit_id, v_count;
end;
$$;

-- The app calls Supabase with the anon key (no Supabase Auth session), so the
-- anon/authenticated roles must be allowed to execute the function.
grant execute on function public.log_visit(bigint, text, integer, text, timestamptz)
  to anon, authenticated;