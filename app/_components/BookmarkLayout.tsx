'use client';

import { useState } from 'react';
import { PlaceDataProvider } from '@/app/_lib/contexts/PlaceDataContext';
import AppNav from '@/app/_components/AppNav';
import Pagination from '@/app/_components/Pagination';
import BookmarkList from '@/app/_components/BookmarkList';
import DistanceTab from '@/app/_components/DistanceTab';

type PanelTab = 'list' | 'distance';

export default function BookmarkLayout({
  bookmarks,
  count,
  sort,
  query,
  page,
}) {
  const [tab, setTab] = useState<PanelTab>('list');

  // Both panels stay mounted (toggled via CSS) so DistanceTab's local UI
  // state — selected bookmark, last result — survives a tab switch.
  return (
    <PlaceDataProvider value={{ bookmarks, sort, query, page }}>
      <div className='absolute max-w-[24rem] max-h-[82%] p-3 top-20 left-4 hidden md:block z-10 rounded-lg shadow-xl bg-slate-50 dark:bg-slate-800'>
        <AppNav />

        {/* Tab switcher */}
        <div
          role='tablist'
          aria-label='Bookmark panel sections'
          className='flex border-b border-slate-300 mb-2 text-xs font-bold uppercase'
        >
          <button
            role='tab'
            aria-selected={tab === 'list'}
            type='button'
            onClick={() => setTab('list')}
            className={`flex-1 py-2 transition-colors ${
              tab === 'list'
                ? 'text-accent-600 border-b-2 border-accent-600'
                : 'text-slate-500 hover:text-accent-600'
            }`}
          >
            Bookmarks
          </button>
          <button
            role='tab'
            aria-selected={tab === 'distance'}
            type='button'
            onClick={() => setTab('distance')}
            className={`flex-1 py-2 transition-colors ${
              tab === 'distance'
                ? 'text-accent-600 border-b-2 border-accent-600'
                : 'text-slate-500 hover:text-accent-600'
            }`}
          >
            Distance
          </button>
        </div>

        {/* List panel */}
        <div className={tab === 'list' ? '' : 'hidden'}>
          <BookmarkList />
          <footer className='flex flex-col'>
            <Pagination count={count} />
          </footer>
        </div>

        {/* Distance panel */}
        <div className={tab === 'distance' ? '' : 'hidden'}>
          <DistanceTab />
        </div>
      </div>
    </PlaceDataProvider>
  );
}
