'use server';

import { supabase } from './supabase';
import { PAGE_SIZE } from './utils/constants';
import type { Park, Bookmark, PaginationQuery } from '@/types/park';
import type { User, UpdateUser } from '@/types/user';

/////////////
// GET

// get single park
export async function getPark(id: number): Promise<Park | null> {
  const { data, error } = await supabase
    .from('parklist')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getPark error]', error);
    return null;
  }

  return data as Park;
}

// ✅ get park data and count (with sorting + pagination)
export async function getParkLists({
  email,
  page,
  query,
  sortBy = 'date', // default sort column
  sortOrder = 'desc', // default order: newest first
}: PaginationQuery = {}): Promise<{ data: Park[]; count: number | null }> {
  let queryBuilder = supabase
    .from('parklist')
    .select('*', { count: 'exact' })
    .eq('email', email);

  // filtering
  if (query) queryBuilder = queryBuilder.ilike('parkName', `%${query}%`);

  // ✅ sorting
  queryBuilder = queryBuilder.order(sortBy, {
    ascending: sortOrder === 'asc',
  });

  // pagination
  if (page) {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    queryBuilder = queryBuilder.range(from, to);
  }

  const { data, count, error } = await queryBuilder;

  if (error) {
    console.error('[getParkLists error]', error);
    throw new Error('Could not load park data');
  }

  return { data: (data as Park[]) ?? [], count };
}

// get user park count
export async function getUserParkCount(email: string): Promise<number> {
  const { count, error } = await supabase
    .from('parklist')
    .select('*', { count: 'exact', head: true })
    .eq('email', email);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

// ✅ get bookmarks data, sort and page
export async function getBookmarkLists({
  email,
  page,
  query,
  sortBy = 'date',
  sortOrder = 'desc',
}: PaginationQuery = {}): Promise<{ data: Bookmark[]; count: number | null }> {
  let queryBuilder = supabase
    .from('bookmark')
    .select('*', { count: 'exact' })
    .eq('email', email);

  if (query) queryBuilder = queryBuilder.ilike('parkName', `%${query}%`);

  // ✅ sorting
  queryBuilder = queryBuilder.order(sortBy, {
    ascending: sortOrder === 'asc',
  });

  if (page) {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    queryBuilder = queryBuilder.range(from, to);
  }

  const { data, count, error } = await queryBuilder;

  if (error) {
    console.error('[getBookmarkLists error]', error);
    throw new Error('Could not load bookmark data');
  }

  return { data: (data as Bookmark[]) ?? [], count };
}

// bookmarks count
export async function getBookmarksCount(
  email: string
): Promise<{ count: number }> {
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
  email: string
): Promise<{ count: number }> {
  const { count, error } = await supabase
    .from('parklist')
    .select('*', { count: 'exact' })
    .eq('email', email);

  if (error) {
    console.error('[getPhotosCount error]', error);
    return { count: 0 };
  }

  return { count };
}

// average park rating per user
export async function getRating(
  email: string
): Promise<{ starRating: number }[]> {
  const { data, error } = await supabase
    .from('parklist')
    .select('starRating')
    .eq('email', email);

  if (error) {
    console.error('[getRating error]', error);
    return [];
  }

  return data;
}

// average app rating
export async function getAppRating(): Promise<{ appRating: number }[]> {
  const { data, error } = await supabase.from('feedbacks').select('appRating');

  if (error) {
    console.error('[getAppRating error]', error);
    return [];
  }

  return data;
}

// get user by email
// get single user by email
export async function getUser(
  email: string | null
): Promise<UpdateUser | null> {
  if (!email) return null;

  const { data, error } = await supabase
    .from('user')
    .select('fullName, email, numOfKids, gender, avatar, role')
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
  newUser: Record<string, any>
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
  userId,
  appRating,
  review,
}: {
  userId: string;
  appRating: number;
  review: string;
}): Promise<Record<string, any>[]> {
  const { data, error } = await supabase.from('feedbacks').insert({
    created_at: new Date().toISOString(),
    userId,
    appRating,
    review,
  });

  if (error) {
    console.error('[createFeedback error]', error);
    throw new Error('Review could not be created');
  }

  return data;
}
