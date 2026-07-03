'use client';

import { PlaceDataProvider } from '@/app/_lib/contexts/PlaceDataContext';
import AppNav from './AppNav';
import Pagination from './Pagination';
import PlaceLists from './PlaceLists';

export default function PlaceLayout({ data }) {
  const { placeLists, sort, query, page, count } = data;

  return (
    <PlaceDataProvider value={{ places: placeLists, sort, query, page }}>
      {/* Header — natural height, never shrinks */}
      <div className='shrink-0'>
        <AppNav />
      </div>

      {/* List — flex-1 min-h-0 lives inside PlaceLists.tsx */}
      <PlaceLists />

      {/* Footer — pinned at the bottom of the flex column */}
      <footer className='shrink-0 pt-2'>
        <Pagination count={count} />
      </footer>
    </PlaceDataProvider>
  );
}
