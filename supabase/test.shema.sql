
create table if not exists public.placelist (
  id              bigint generated always as identity primary key,
  email           text not null,
  place_name      text,
  visit_count     integer not null default 0,
  last_visited_at timestamptz
);

create table if not exists public.visits (
  id           bigint generated always as identity primary key,
  email        text not null,
  place_id     bigint not null references public.placelist(id) on delete cascade,
  visited_at   timestamptz not null default now(),
  visit_rating integer not null check (visit_rating between 1 and 5),
  note         text,
  created_at   timestamptz not null default now()
);

-- log_visit — same body as supabase/log_visit.sql (kept in sync by hand).
drop function if exists public.log_visit(bigint, text, integer, text, timestamptz);

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
  -- 1. Rating required, 1–5.
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'rating must be between 1 and 5' using errcode = '22023';
  end if;

  -- 2. Ownership guard.
  if not exists (
    select 1 from public.placelist where id = p_place_id and email = p_email
  ) then
    raise exception 'place % not found or not owned by %', p_place_id, p_email
      using errcode = '42501';
  end if;

  -- 3. Insert the visit.
  insert into public.visits (email, place_id, visited_at, visit_rating, note)
  values (p_email, p_place_id, v_when, p_rating, p_note)
  returning id into v_visit_id;

  -- 4. Bump the denormalized counters in the SAME transaction.
  update public.placelist pl
     set visit_count     = pl.visit_count + 1,
         last_visited_at = greatest(coalesce(pl.last_visited_at, to_timestamp(0)), v_when)
   where pl.id = p_place_id and pl.email = p_email
   returning pl.visit_count into v_count;

  return query select v_visit_id, v_count;
end;
$$;

grant execute on function public.log_visit(bigint, text, integer, text, timestamptz)
  to anon, authenticated;