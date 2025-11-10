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
      parkId: bookmark.parkId,
      parkName: bookmark.parkName ?? `Park ${bookmark.parkId}`,
      date: bookmark.date,
      position: bookmark.position,
      starRating: bookmark.starRating ?? 0,
    }));

    // Sorting logic
    switch (sort) {
      case 'date-desc':
        return mapped.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      case 'date-asc':
        return mapped.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      case 'rating-desc':
        return mapped.sort((a, b) => b.starRating - a.starRating);
      case 'rating-asc':
        return mapped.sort((a, b) => a.starRating - b.starRating);
      default:
        return mapped;
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
