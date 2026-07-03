'use client';

import { useSearchParams } from 'next/navigation';

export function useUrlPosition(): [number | null, number | null] {
  const searchParams = useSearchParams();

  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  return [lat ? Number(lat) : null, lng ? Number(lng) : null];
}
