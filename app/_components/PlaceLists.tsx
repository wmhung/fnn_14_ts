'use client';

import { useMemo } from 'react';
import { usePlaceData } from '../_lib/contexts/PlaceDataContext';
import PlaceItem from './PlaceItem';
import type { Place } from '@/types/place';

export default function PlaceLists() {
  const { places, sort } = usePlaceData();

  const sortedPlaces = useMemo(() => {
    if (!places?.length) return [];

    const copy = [...places];

    switch (sort) {
      case 'date-desc':
        return copy.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
      case 'date-asc':
        return copy.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
      case 'rating-desc':
        return copy.sort((a, b) => (b.star_rating ?? 0) - (a.star_rating ?? 0));
      case 'rating-asc':
        return copy.sort((a, b) => (a.star_rating ?? 0) - (b.star_rating ?? 0));
      default:
        return copy;
    }
  }, [places, sort]);

  if (!sortedPlaces.length) {
    return (
      <div className='flex items-center justify-center w-full xs:max-h-[42vh] max-h-[63vh] mx-1 my-2 border shadow-sm rounded-lg text-slate-500 text-center inset-shadow text-xl'>
        <p>Start by clicking the map to add your first place!</p>
      </div>
    );
  }

  return (
    <div className='flex justify-center'>
      <div className='w-full xs:max-h-[42vh] max-h-[63vh] mx-1 my-2 border shadow-sm rounded-lg overflow-y-scroll overflow-x-hidden'>
        <ul className='list-none'>
          {sortedPlaces.map((place: Place) => (
            <li key={place.id}>
              <PlaceItem place={place} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
