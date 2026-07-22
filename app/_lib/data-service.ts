'use server';

import { unstable_noStore as noStore } from 'next/cache';
import { supabase } from './supabase';
import { PAGE_SIZE } from './utils/constants';
import type {
  Place,
  Bookmark,
  PaginationQuery,
  Visit,
  VisitInput,
} from '@/types/place';
import type { User, UpdateUser } from '@/types/user';

/////////////
// GET

// get single place
// user_name is DERIVED from user.full_name via the placelist_email_fkey
// relationship — never stored. See getPlaceLists for the full rationale.
export async function getPlace(id: number): Promise<Place | null> {
  const { data, error } = await supabase
    .from('placelist')
    .select('*, user(full_name)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getPlace error]', error);
    return null;
  }

  const { user, ...place } = data as any;
  return { ...place, user_name: user?.full_name ?? 'Anonymous' } as Place;
}

/////////////
// REPEAT VISITS

// Log a repeat visit. The insert + counter bump run atomically inside the
// log_visit Postgres function (see supabase/log_visit.sql) so visit_count
// can't drift. Returns the new total.
export async function logVisit({
  placeId,
  email,
  rating,
  note,
  visitedAt,
}: VisitInput): Promise<{ visit_id: number; visit_count: number }> {
  const { data, error } = await supabase.rpc('log_visit', {
    p_place_id: placeId,
    p_email: email,
    p_rating: rating,
    p_note: note ?? null,
    p_visited_at: visitedAt ?? new Date().toISOString(),
  });

  if (error) {
    console.error('[logVisit error]', error);
    throw new Error(error.message);
  }

  // The function "returns table", so Supabase hands back an array of one row.
  const row = (Array.isArray(data) ? data[0] : data) as {
    visit_id: number;
    visit_count: number;
  };
  return { visit_id: row.visit_id, visit_count: row.visit_count };
}

// A place's visit history, newest first (own visits only).
export async function getVisits(
  placeId: number,
  email: string,
): Promise<Visit[]> {
  const { data, error } = await supabase
    .from('visits')
    .select('id, place_id, visited_at, visit_rating, note, created_at')
    .eq('place_id', placeId)
    .eq('email', email)
    .order('visited_at', { ascending: false });

  if (error) {
    console.error('[getVisits error]', error);
    return [];
  }

  return (data ?? []) as Visit[];
}

// ✅ get place data and count (with sorting + pagination)
export async function getPlaceLists({
  email,
  page,
  query,
  sort = 'date-desc',
}: PaginationQuery & { sort?: string } = {}): Promise<{
  data: Place[];
  count: number | null;
}> {
  let queryBuilder = supabase
    // Embed user.full_name instead of reading the old denormalized
    // placelist.user_name copy — that copy had no sync path, so renaming a
    // user left every existing place showing the stale name (update anomaly).
    // Plain embed (not !inner) on purpose: if a user row ever disappears, the
    // place should still render as "Anonymous" rather than vanish from the list.
    .from('placelist')
    .select('*, user(full_name)', { count: 'exact' })
    .eq('email', email);

  // filtering
  if (query) {
    queryBuilder = queryBuilder.ilike('place_name', `%${query}%`);
  }

  // -----------------------------
  // ✅ SORT MAPPING (IMPORTANT FIX)
  // -----------------------------
  const [field, order] = sort.split('-');

  const sortColumnMap: Record<string, string> = {
    date: 'date',
    rating: 'star_rating',
  };

  const sortBy = sortColumnMap[field] ?? 'date';

  const ascending = order === 'asc';

  queryBuilder = queryBuilder.order(sortBy, { ascending });

  // -----------------------------
  // pagination
  // -----------------------------
  if (page) {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    queryBuilder = queryBuilder.range(from, to);
  }

  const { data, count, error } = await queryBuilder;

  if (error) {
    console.error('[getPlaceLists error]', error);
    throw new Error(error.message);
  }

  // Flatten the embedded user object so the UI contract is unchanged — same
  // pattern as getBookmarkLists. Callers (e.g. Map.tsx) still read
  // `place.user_name`; it is now derived per-read, so it cannot drift.
  const flattened = ((data ?? []) as any[]).map((row) => {
    const { user, ...place } = row;
    return { ...place, user_name: user?.full_name ?? 'Anonymous' };
  }) as Place[];

  return { data: flattened, count };
}

// get user place count
export async function getUserPlaceCount(email: string): Promise<number> {
  // Always read live — without this, Next.js caches the Supabase fetch and the
  // count goes stale (e.g. keeps returning 4 after the rows were deleted), which
  // breaks first-add detection.
  noStore();
  // NOTE: dropped `head: true` — it was returning a null count in this setup,
  // so first-add detection always saw 0 and the feedback modal showed on every
  // add. Matches the working getPhotosCount / getBookmarksCount pattern.
  const { count, error } = await supabase
    .from('placelist')
    .select('*', { count: 'exact' })
    .eq('email', email);

  if (error) {
    console.error('[getUserPlaceCount error]', error);
    throw new Error(error.message);
  }
  return count ?? 0;
}

// get bookmarks data, sort and page — JOINs through placelist for fresh data,
// then flattens the response to preserve the old denormalized shape so the
// bookmarks-tab UI stays unchanged.
export async function getBookmarkLists({
  email,
  page,
  query,
  sort = 'date-desc',
}: PaginationQuery & { sort?: string } = {}): Promise<{
  data: Bookmark[];
  count: number | null;
}> {
  let queryBuilder = supabase
    .from('bookmark')

    .select('id, email, place_id, created_at, placelist!inner(*)', {
      count: 'exact',
    })
    .eq('email', email);

  // filtering through the joined table (place_name lives on placelist)

  if (query) {
    queryBuilder = queryBuilder.ilike('placelist.place_name', `%${query}%`);
  }

  // sorting — same field names as places, but the columns live on placelist

  const [field, order] = sort.split('-');

  const sortColumnMap: Record<string, string> = {
    date: 'date',
    rating: 'star_rating',
  };

  const sortBy = sortColumnMap[field] ?? 'date';
  const ascending = order === 'asc';

  queryBuilder = queryBuilder.order(sortBy, {
    foreignTable: 'placelist',
    ascending,
  });

  // pagination

  if (page) {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    queryBuilder = queryBuilder.range(from, to);
  }

  const { data, count, error } = await queryBuilder;

  if (error) {
    console.error('[getBookmarkLists error]', error);
    throw new Error(error.message);
  }

  // use placelist data
  const flattened = ((data ?? []) as any[]).map((row) => {
    const { placelist: place, ...bookmark } = row;
    return {
      ...(place ?? {}),
      ...bookmark,
    };
  }) as Bookmark[];

  return {
    data: flattened,
    count,
  };
}

export async function updatePlace(
  id: number,
  email: string,
  patch: Partial<Place>,
): Promise<Place> {
  // Strip fields the user shouldn't be able to overwrite
  const { id: _omit, email: _omitEmail, ...safePatch } = patch as any;

  const { data, error } = await supabase
    .from('placelist')
    .update(safePatch)
    .eq('id', id)
    .eq('email', email) // ownership guard — DB-level
    .select()
    .single();

  if (error) {
    console.error('[updatePlace error]', error);
    throw new Error(error.message);
  }
  return data as Place;
}

// bookmarks count
export async function getBookmarksCount(
  email: string,
): Promise<{ count: number }> {
  noStore(); // always read live — counts must not be served stale from cache
  const { count, error } = await supabase
    .from('bookmark')
    .select('*', { count: 'exact' })
    .eq('email', email);

  if (error) {
    console.error('[getBookmarksCount error]', error);
    return { count: 0 };
  }

  return { count };
}

// photos count
export async function getPhotosCount(
  email: string,
): Promise<{ count: number }> {
  noStore(); // always read live — counts must not be served stale from cache
  const { count, error } = await supabase
    .from('placelist')
    .select('*', { count: 'exact' })
    .eq('email', email);

  if (error) {
    console.error('[getPhotosCount error]', error);
    return { count: 0 };
  }

  return { count };
}

// average place rating per user
export async function getRating(
  email: string,
): Promise<{ star_rating: number }[]> {
  const { data, error } = await supabase
    .from('placelist')
    .select('star_rating')
    .eq('email', email);

  if (error) {
    console.error('[getRating error]', error);
    return [];
  }

  return data;
}

// average app rating
export async function getAppRating(): Promise<{ app_rating: number }[]> {
  const { data, error } = await supabase.from('feedbacks').select('app_rating');

  if (error) {
    console.error('[getAppRating error]', error);
    return [];
  }

  return data;
}

// get user by email
// get single user by email
export async function getUser(
  email: string | null,
): Promise<UpdateUser | null> {
  if (!email) return null;

  const { data, error } = await supabase
    .from('user')
    .select('full_name, email, num_of_kids, gender, avatar, role')
    .eq('email', email)
    .single();

  if (error) {
    console.error('[getUser error]', error);
    return null;
  }

  return data as UpdateUser;
}

// get all users data
export async function getUsersData(): Promise<User[]> {
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[getUsersData error]', error);
    return [];
  }

  // Ensure correct type
  return (data ?? []) as User[];
}

// CREATE

export async function createUser(
  newUser: Record<string, any>,
): Promise<Record<string, any>[]> {
  const { data, error } = await supabase.from('user').insert([newUser]);

  if (error) {
    console.error('[createUser error]', error);
    throw new Error('User could not be created');
  }

  return data;
}

// create feedback
export async function createFeedback({
  email,
  app_rating,
  review,
}: {
  email: string;
  app_rating: number;
  review: string;
}): Promise<Record<string, any>[]> {
  const { data, error } = await supabase.from('feedbacks').insert({
    created_at: new Date().toISOString(),
    email, // FK -> user(email), consistent with placelist/visits
    app_rating,
    review,
  });

  if (error) {
    console.error('[createFeedback error]', error);
    throw new Error('Review could not be created');
  }

  return data;
}
