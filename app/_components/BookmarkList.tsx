'use client';

import { useMemo } from 'react';
import {
  usePlaceData,
  Bookmark as BookmarkType,
} from '../_lib/contexts/PlaceDataContext';
import BookmarkItem from './BookmarkItem';

export default function BookmarkList() {
  const { bookmarks, sort } = usePlaceData();

  const sortedBookmarks: BookmarkType[] = useMemo(() => {
    if (!bookmarks?.length) return [];

    // Normalize each bookmark with safe fallbacks
    const mapped: BookmarkType[] = bookmarks.map((bookmark, idx) => ({
      id: bookmark.id ?? idx,
      place_id: bookmark.place_id,
      place_name: bookmark.place_name ?? `Place ${bookmark.place_id}`,
      date: bookmark.date,
      position: bookmark.position,
      star_rating: bookmark.star_rating ?? 0,
    }));

    return mapped.sort((a, b) => {
      switch (sort) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'rating-desc':
          return (b.star_rating ?? 0) - (a.star_rating ?? 0);
        case 'rating-asc':
          return (a.star_rating ?? 0) - (b.star_rating ?? 0);
        default:
          return 0;
      }
    });
  }, [bookmarks, sort]);

  if (!sortedBookmarks.length) {
    return (
      <div className='flex items-center justify-center w-full xs:max-h-[42vh] max-h-[63vh] mx-1 my-2 border shadow-sm rounded-lg text-slate-500 text-center inset-shadow text-xl'>
        <p>There is no data in your bookmark list, yet!</p>
      </div>
    );
  }

  return (
    <div className='flex justify-center'>
      <div className='w-full xs:max-h-[42vh] max-h-[63vh] mx-1 my-2 border shadow-sm rounded-lg overflow-y-scroll overflow-x-hidden'>
        <ul className='list-none'>
          {sortedBookmarks.map((bookmark) => (
            <li key={bookmark.id}>
              <BookmarkItem bookmark={bookmark} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
