import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const url = process.env.TEST_SUPABASE_URL;
const key = process.env.TEST_SERVICE_KEY;
if (!url || !key) {
  throw new Error(
    'Missing TEST_SUPABASE_URL / TEST_SERVICE_KEY — set them in .env.test',
  );
}

// Service-role client: bypasses RLS, talks to the real test Postgres.
const db = createClient(url, key, { auth: { persistSession: false } });

const EMAIL = 'itest@example.com';
let placeId: number;

// Fresh place per test so the tests are order-independent.
beforeEach(async () => {
  const { data, error } = await db
    .from('placelist')
    .insert({
      email: EMAIL,
      place_name: 'Integration Test Park',
      visit_count: 0,
    })
    .select('id')
    .single();
  if (error) throw error;
  placeId = data!.id;
});

afterEach(async () => {
  await db.from('visits').delete().eq('place_id', placeId);
  await db.from('placelist').delete().eq('id', placeId);
});

describe('log_visit RPC', () => {
  it('keeps visit_count in sync with the visits rows', async () => {
    for (let i = 0; i < 3; i++) {
      const { error } = await db.rpc('log_visit', {
        p_place_id: placeId,
        p_email: EMAIL,
        p_rating: 5,
      });
      expect(error).toBeNull();
    }

    const { data: place } = await db
      .from('placelist')
      .select('visit_count')
      .eq('id', placeId)
      .single();
    const { count } = await db
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .eq('place_id', placeId);

    expect(place!.visit_count).toBe(3);
    expect(place!.visit_count).toBe(count); // the invariant
  });

  it('rejects a rating outside 1–5 (22023)', async () => {
    const { error } = await db.rpc('log_visit', {
      p_place_id: placeId,
      p_email: EMAIL,
      p_rating: 6,
    });
    expect(error?.code).toBe('22023');
  });

  it('rejects logging to a place you do not own (42501)', async () => {
    const { error } = await db.rpc('log_visit', {
      p_place_id: placeId,
      p_email: 'someone@else.com',
      p_rating: 5,
    });
    expect(error?.code).toBe('42501');
  });

  it('back-dating adds a visit but never moves last_visited_at backwards', async () => {
    await db.rpc('log_visit', {
      p_place_id: placeId,
      p_email: EMAIL,
      p_rating: 5,
    });
    const before = (
      await db
        .from('placelist')
        .select('visit_count,last_visited_at')
        .eq('id', placeId)
        .single()
    ).data!;

    await db.rpc('log_visit', {
      p_place_id: placeId,
      p_email: EMAIL,
      p_rating: 5,
      p_visited_at: '2020-01-01T00:00:00Z',
    });
    const after = (
      await db
        .from('placelist')
        .select('visit_count,last_visited_at')
        .eq('id', placeId)
        .single()
    ).data!;

    expect(after.visit_count).toBe(before.visit_count + 1);
    expect(after.last_visited_at).toBe(before.last_visited_at);
  });
});
