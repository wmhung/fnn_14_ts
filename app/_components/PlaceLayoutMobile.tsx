'use client';

import { useEffect, useState } from 'react';
import { useMobilePanel } from '../_lib/contexts/MobilePanelContext';
import { PlaceDataProvider } from '../_lib/contexts/PlaceDataContext';

import PlaceLists from './PlaceLists';
import BookmarkList from './BookmarkList';
import DistanceTab from './DistanceTab';
import AppNav from './AppNav';
import Pagination from './Pagination';
import MobilePanelToggle from './MobilePanelToggle';

type PlaceLayoutMobileProps = {
  data: any;
  children?: React.ReactNode; // ✅ make optional
};

export default function PlaceLayoutMobile({ data }: PlaceLayoutMobileProps) {
  const { view } = useMobilePanel();
  const [visibleView, setVisibleView] = useState(view);
  const { placeLists, bookmarkLists, sort, query, page, count } = data;

  // Handle animation when switching views
  useEffect(() => {
    if (view) {
      setVisibleView(view);
    } else {
      const timeout = setTimeout(() => setVisibleView(null), 200); // match transition duration
      return () => clearTimeout(timeout);
    }
  }, [view]);

  return (
    <PlaceDataProvider
      value={{
        places: placeLists,
        bookmarks: bookmarkLists,
        sort,
        query,
        page,
        count,
      }}
    >
      {/* Mobile slide-in panel */}
      {visibleView && (
        <div
          className={`fixed w-full h-[92vh] bg-[rgba(0,0,0,0.7)] z-[40] left-0 top-0 transform transition-transform duration-100 ease-in-out ${
            view ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          <div className='absolute h-[83vh] bottom-0 left-0 right-0 py-2 z-50 bg-slate-50 dark:bg-slate-800 rounded-t-lg overflow-y-hidden overflow-x-hidden'>
            {visibleView === 'list' && (
              <>
                <div className='flex justify-center items-center'>
                  <AppNav />
                </div>
                <PlaceLists />
                <Pagination count={count} />
              </>
            )}

            {visibleView === 'bookmarks' && (
              <>
                <div className='flex justify-center items-center'>
                  <AppNav />
                </div>
                <BookmarkList />
                <Pagination count={count} />
              </>
            )}

            {visibleView === 'distance' && (
              <div className='h-full overflow-y-auto'>
                <DistanceTab />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom toggle buttons */}
      <div className='fixed bottom-[2px] left-0 right-0 z-50 flex justify-center bg-slate-50'>
        <MobilePanelToggle />
      </div>
    </PlaceDataProvider>
  );
}
