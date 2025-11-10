'use client';

import { useMemo } from 'react';
import { useParkData } from '../../_lib/contexts/ParkDataContext';
import BookmarkItem from '../BookmarkItem';

export default function BookmarkList() {
  const { bookmarks, sort } = useParkData();

  const sortedBookmarks = useMemo(() => {
    if (!bookmarks?.length) return [];

    const copy = [...bookmarks];

    switch (sort) {
      case 'date-desc':
        return copy.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'date-asc':
        return copy.sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'rating-desc':
        return copy.sort((a, b) => b.starRating - a.starRating);
      case 'rating-asc':
        return copy.sort((a, b) => a.starRating - b.starRating);
      default:
        return copy;
    }
  }, [bookmarks, sort]);

  if (!sortedBookmarks.length) {
    return (
      <div className='flex items-center justify-center w-full max-h-[60%] mx-1 my-2 border shadow-sm rounded-lg text-slate-500 text-center inset-shadow text-xl'>
        <p>There is no data in your bookmark list, yet!</p>
      </div>
    );
  }

  return (
    <div className='flex justify-center'>
      <div className='flex justify-center w-full max-h-[60%] mx-1 my-2 border shadow-sm rounded-lg overflow-y-scroll overflow-x-hidden gap-[3px] list-none'>
        <ul>
          {sortedBookmarks.map((bookmark) => (
            <BookmarkItem bookmark={bookmark} key={bookmark.parkId} />
          ))}
        </ul>
      </div>
    </div>
  );
}
