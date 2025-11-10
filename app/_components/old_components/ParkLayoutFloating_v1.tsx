'use client';
import { useEffect, useState } from 'react';
import ParkLayout from '../ParkLayout';
import ParkLayoutMobile from '../ParkLayoutMobile';
import { ParkDataProvider } from '../../_lib/contexts/ParkDataContext';
import { MobilePanelProvider } from '../../_lib/contexts/MobilePanelContext';
import { getParkLists, getBookmarkLists } from '../../_lib/data-service';

export default function ParkListFloating({ searchParams, userEmail }: any) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const page = searchParams?.page ? Number(searchParams.page) : 1;
      const query = searchParams?.query ?? '';
      const sort = searchParams?.sort ?? 'date-desc';

      const { data: parkLists, count } = await getParkLists({
        page,
        query,
        sort,
        email: userEmail,
      });
      const { data: bookmarkLists } = await getBookmarkLists({
        email: userEmail,
      });

      setData({ parkLists, bookmarkLists, sort, query, page, count });
    }
    fetchData();
  }, [searchParams, userEmail]);

  if (!data) return null; // wait until fetched

  return (
    <MobilePanelProvider>
      <ParkDataProvider value={data}>
        {/* Desktop floating panel */}
        <div className='absolute top-20 left-4 max-w-[23rem] max-h-[82%] p-3 hidden md:block z-10 rounded-lg shadow-xl bg-slate-50 dark:bg-slate-800 overflow-hidden'>
          <ParkLayout data={data} />
        </div>

        {/* Mobile floating panel */}
        <div className='absolute bottom-0 left-0 right-0 h-[60%] md:hidden z-10 rounded-t-lg shadow-xl bg-slate-50 dark:bg-slate-800 overflow-hidden'>
          <ParkLayoutMobile data={data} />
        </div>
      </ParkDataProvider>
    </MobilePanelProvider>
  );
}
