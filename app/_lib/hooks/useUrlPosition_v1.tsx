'use client';
// 1. Used "use client"; to ensure the hook runs only on the client side.
// 2. Replaced react-router-dom with next/navigation.
import { useSearchParams } from 'next/navigation';

export function useUrlPosition() {
  const searchParams = useSearchParams();

  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  return [lat, lng];
}
