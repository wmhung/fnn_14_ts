'use server';

import { supabase } from './supabase';
import { notFound } from 'next/navigation';
import { PAGE_SIZE } from './utils/constants';

// import { auth } from './auth';
/////////////
// GET

export async function getPark(id) {
  const { data, error } = await supabase
    .from('parklist')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getPark error]', error);
    return null;
  }

  return data;
}

// get park data and count
export async function getParkLists({ email, page, query } = {}) {
  let queryBuilder = supabase
    .from('parklist')
    .select('*', { count: 'exact' })
    .eq('email', email);

  if (query) {
    queryBuilder = queryBuilder.ilike('parkName', `%${query}%`);
  }

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

  return { data, count };
}

// get user park count
export async function getUserParkCount(email) {
  const { count, error } = await supabase
    .from('parklist')
    .select('*', { count: 'exact', head: true })
    .eq('email', email);

  if (error) throw new Error(error.message);

  return count ?? 0; // fallback to 0 if somehow null
}

// get bookmarks data, sort and page
export async function getBookmarkLists({ email, page, query } = {}) {
  let queryBuilder = supabase
    .from('bookmark')
    .select('*', { count: 'exact' })
    .eq('email', email);

  if (query) {
    queryBuilder = queryBuilder.ilike('parkName', `%${query}%`);
  }

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

  return { data, count };
}

// bookmarks count
export async function getBookmarksCount(email) {
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
export async function getPhotosCount(email) {
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
export async function getRating(email) {
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
export async function getAppRating() {
  const { data, error } = await supabase.from('feedbacks').select('appRating');

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

// Users are uniquely identified by their email address
export async function getUser(email) {
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .eq('email', email)
    .single();

  return data;
}

// Users data
export async function getUsersData() {
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .order('created_at', { ascending: true })
    .throwOnError(); // Optional: ensures it throws if error occurs;

  return data;
}

// CREATE

export async function createUser(newUser) {
  const { data, error } = await supabase.from('user').insert([newUser]);

  if (error) {
    console.error(error);
    throw new Error('User could not be created');
  }

  return data;
}

// create feedback
export async function createFeedback({ userId, appRating, review }) {
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
