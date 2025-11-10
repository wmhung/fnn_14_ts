'use client';

import { ParkDataProvider } from '@/app/_lib/contexts/ParkDataContext';
import AppNav from './AppNav';
import Pagination from './Pagination';
import ParkLists from './ParkLists';

export default function ParkLayout({ data }) {
  const { parkLists, sort, query, page, count } = data;

  // console.log('page', page);

  return (
    <ParkDataProvider value={{ parks: parkLists, sort, query, page }}>
      <AppNav />
      <ParkLists />
      <footer className='flex flex-col'>
        <Pagination count={count} />
      </footer>
    </ParkDataProvider>
  );
}
