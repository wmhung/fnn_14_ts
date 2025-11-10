'use client';

import { ParkDataProvider } from '@/app/_lib/contexts/ParkDataContext';
import AppNav from '@/app/_components/AppNav';
import Pagination from '@/app/_components/Pagination';
import BookmarkList from '@/app/_components/BookmarkList';

export default function BookmarkLayout({
  bookmarks,
  count,
  sort,
  query,
  page,
}) {
  return (
    <ParkDataProvider value={{ bookmarks, sort, query, page }}>
      <div className='absolute max-w-[23rem] max-h-[82%] py-3 top-[5rem] left-[1rem] bottom-[5px] hidden md:block z-10 rounded-lg shadow-xl bg-slate-50 dark:bg-slate-800'>
        <AppNav />
        <BookmarkList />
        <footer className='flex flex-col'>
          <Pagination count={count} />
        </footer>
      </div>
    </ParkDataProvider>
  );
}
