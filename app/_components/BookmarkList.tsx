'use client';

import { useMemo } from 'react';
import {
  useParkData,
  Bookmark as BookmarkType,
} from '../_lib/contexts/ParkDataContext';
import BookmarkItem from './BookmarkItem';

export default function BookmarkList() {
  const { bookmarks, sort } = useParkData();

  // Ensure bookmarks is an array of BookmarkType
  const sortedBookmarks: BookmarkType[] = useMemo(() => {
    if (!bookmarks?.length) return [];

    // Map and normalize each bookmark
    const mapped: BookmarkType[] = bookmarks.map((bookmark, idx: number) => ({
      id: bookmark.id ?? idx, // fallback if id is missing
      park_id: bookmark.park_id,
      park_name: bookmark.park_name ?? `Park ${bookmark.park_id}`,
      date: bookmark.date,
      position: bookmark.position,
      star_rating: bookmark.star_rating ?? 0,
    }));

    // ✅ Client-side sorting fallback (server may already sort)
    return mapped.sort((a, b) => {
      switch (sort) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'rating-desc':
          return (b.starRating ?? 0) - (a.starRating ?? 0);
        case 'rating-asc':
          return (a.starRating ?? 0) - (b.starRating ?? 0);
        default:
          return 0;
      }
    });
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
