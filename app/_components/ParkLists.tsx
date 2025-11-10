'use client';

import { useMemo } from 'react';
import { useParkData } from '../_lib/contexts/ParkDataContext';
import ParkItem from './ParkItem';
import type { Park } from '@/types/park';

export default function ParkLists() {
  const { parks, sort } = useParkData();

  const sortedParks = useMemo(() => {
    if (!parks?.length) return [];

    const copy = [...parks];

    switch (sort) {
      case 'date-desc':
        return copy.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      case 'date-asc':
        return copy.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      case 'rating-desc':
        return copy.sort((a, b) => (b.starRating ?? 0) - (a.starRating ?? 0));
      case 'rating-asc':
        return copy.sort((a, b) => (a.starRating ?? 0) - (b.starRating ?? 0));
      default:
        return copy;
    }
  }, [parks, sort]);

  if (!sortedParks.length) {
    return (
      <div className='flex items-center justify-center w-full max-h-[60%] mx-1 my-2 border shadow-sm rounded-lg text-slate-500 text-center inset-shadow text-xl'>
        <p>Start by clicking the map to add your first place!</p>
      </div>
    );
  }

  return (
    <div className='flex justify-center'>
      <div className='flex justify-center w-full max-h-[60%] mx-1 my-2 border shadow-sm rounded-lg overflow-y-scroll overflow-x-hidden gap-[3px] list-none'>
        <ul>
          {sortedParks.map((park: Park) => (
            <ParkItem park={park} key={park.id} />
          ))}
        </ul>
      </div>
    </div>
  );
}
