'use client';

import { useEffect, useState } from 'react';
import { useMobilePanel } from '../_lib/contexts/MobilePanelContext';
import { ParkDataProvider } from '../_lib/contexts/ParkDataContext';

import ParkLists from './ParkLists';
import BookmarkList from './BookmarkList';
import AppNav from './AppNav';
import Pagination from './Pagination';
import MobilePanelToggle from './MobilePanelToggle';

export default function ParkLayoutMobile({ children, data }) {
  const { view, setView } = useMobilePanel();
  const [visibleView, setVisibleView] = useState(view);
  const { parkLists, bookmarkLists, sort, query, page, count } = data;

  // Animate panel out before unmounting
  useEffect(() => {
    if (view) {
      setVisibleView(view);
    } else {
      const timeout = setTimeout(() => setVisibleView(null), 200); // match transition duration
      return () => clearTimeout(timeout);
    }
  }, [view]);

  return (
    <ParkDataProvider
      value={{
        parks: parkLists,
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
          <div className='absolute h-[83vh] bottom-0 left-0 right-0 py-2 z-50 bg-slate-50 dark:bg-slate-800 rounded-t-lg overflow-y-auto overflow-x-hidden'>
            {visibleView === 'list' && (
              <>
                <div className='flex justify-center items-center'>
                  <AppNav />
                </div>
                <ParkLists />
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
          </div>
        </div>
      )}

      {/* Bottom toggle buttons */}
      <div className='fixed bottom-1 left-0 right-0 z-50 flex justify-center bg-slate-50'>
        <MobilePanelToggle />
      </div>
    </ParkDataProvider>
  );
}
