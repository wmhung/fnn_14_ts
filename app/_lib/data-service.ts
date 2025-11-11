'use server';

import { supabase } from './supabase';
import { PAGE_SIZE } from './utils/constants';
import type { Park, Bookmark, PaginationQuery } from '@/types/park';

// import { auth } from './auth';
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

// get park data and count
// import and use GetParkListsParams type
export async function getParkLists({
  email,
  page,
  query,
}: PaginationQuery = {}): Promise<{ data: Park[]; count: number | null }> {
  let queryBuilder = supabase
    .from('parklist')
    .select('*', { count: 'exact' })
    .eq('email', email);

  if (query) queryBuilder = queryBuilder.ilike('parkName', `%${query}%`);

  if (page) {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    queryBuilder = queryBuilder.range(from, to);
  }

  const { data, count, error } = await queryBuilder;

  if (error) {
    console.error(error);
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

  return count ?? 0; // fallback to 0 if somehow null
}

// get bookmarks data, sort and page
// reuse the same GetParkListsParams type
export async function getBookmarkLists({
  email,
  page,
  query,
}: PaginationQuery = {}): Promise<{ data: Bookmark[]; count: number | null }> {
  let queryBuilder = supabase
    .from('bookmark')
    .select('*', { count: 'exact' })
    .eq('email', email);

  if (query) queryBuilder = queryBuilder.ilike('parkName', `%${query}%`);

  if (page) {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    queryBuilder = queryBuilder.range(from, to);
  }

  const { data, count, error } = await queryBuilder;

  if (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    return { count: 0 };
  }

  return { count };
}

// The average rating of parks
export async function getRating(
  email: string
): Promise<{ starRating: number }[]> {
  const { data, error } = await supabase
    .from('parklist')
    .select('starRating')
    .eq('email', email);

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

// The average rating of user feedback
export async function getAppRating(): Promise<{ appRating: number }[]> {
  const { data, error } = await supabase.from('feedbacks').select('appRating');

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

// Users are uniquely identified by their email address
export async function getUser(
  email: string
): Promise<Record<string, any> | null> {
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .eq('email', email)
    .single();

  return data;
}

// Users data
export async function getUsersData(): Promise<Record<string, any>[]> {
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .order('created_at', { ascending: true })
    .throwOnError(); // Optional: ensures it throws if error occurs;

  return data;
}

// CREATE

export async function createUser(
  newUser: Record<string, any>
): Promise<Record<string, any>[]> {
  const { data, error } = await supabase.from('user').insert([newUser]);

  if (error) {
    console.error(error);
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
    console.error(error);
    throw new Error('Review could not be created');
  }

  return data;
}
