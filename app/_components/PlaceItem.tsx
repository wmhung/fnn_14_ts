'use client';

import Link from 'next/link';
import { MdDeleteForever, MdEdit } from 'react-icons/md';
import { IoBookmark } from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MouseEvent } from 'react';
import { usePlaces } from '../_lib/contexts/PlaceContext';
import { useBookmarks } from '../_lib/contexts/BookmarkContext';
import type { Place } from '@/types/place';

interface PlaceItemProps {
  place: Place;
}

const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

function PlaceItem({ place }: PlaceItemProps) {
  const { deletePlace, getPlace } = usePlaces();
  const { bookmarkedPlaceIds, toggleBookmark, removeBookmarksForPlace } =
    useBookmarks();
  const { data: session } = useSession();
  const router = useRouter();

  const {
    id,
    place_name: placeName,
    date,
    position,
    star_rating: starRating,
  } = place;

  // O(1) Set lookup — was O(n) bookmarks.some() before.
  const isBookmarked = bookmarkedPlaceIds.has(id);

  async function handleDelete(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(`Delete "${placeName}"? This cannot be undone.`)) {
      return;
    }

    const sessionEmail = session?.user?.email;
    if (!sessionEmail) return;

    try {
      await deletePlace(id, sessionEmail);

      removeBookmarksForPlace(id);
      router.refresh();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }

  function handleEdit(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/placelist/${id}/edit`);
  }

  async function handleToggleBookmark(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    const sessionEmail = session?.user?.email;
    if (!sessionEmail) return;

    try {
      // Atomic RPC + optimistic flip in one call. The Set updates instantly,
      // and rolls back if the RPC errors.
      await toggleBookmark(id, sessionEmail);
      router.refresh();
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  }

  return (
    <Link
      onClick={() => getPlace(id)}
      prefetch={false}
      href={`placelist/${id}/?lat=${position?.lat ?? 0}&lng=${
        position?.lng ?? 0
      }`}
      className='block w-full max-w-[22rem] mx-auto my-2 px-3 py-2 rounded-lg border border-slate-300
                 cursor-pointer no-underline
                 hover:border-accent-600 hover:shadow-accent-600 hover:shadow-lg
                 dark:shadow-accent-600 transition-all duration-300'
    >
      {/* ROW 1: place name + date */}
      <div className='flex items-center justify-between gap-2 mb-1'>
        <h3 className='flex-1 min-w-0 font-semibold text-base truncate'>
          {placeName}
        </h3>
        <span className='shrink-0 text-xs text-slate-500 dark:text-slate-400'>
          {formatDate(date)}
        </span>
      </div>

      {/* ROW 2: rating (left) + actions (right) */}
      <div className='flex items-center justify-between'>
        <span className='text-sm'>{starRating ? `${starRating} ⭐️` : '—'}</span>

        <div className='flex items-center gap-3'>
          <button
            onClick={handleToggleBookmark}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            className='p-1 -m-1 cursor-pointer'
          >
            <IoBookmark
              size={20}
              className={`hover:text-accent-400 hover:scale-110 transition-transform duration-200 ${
                isBookmarked ? 'text-accent-400' : ''
              }`}
            />
          </button>

          <button
            onClick={handleEdit}
            aria-label='Edit place'
            className='p-1 -m-1 cursor-pointer'
          >
            <MdEdit
              size={20}
              className='hover:text-accent-500 hover:scale-110 transition-transform duration-200'
            />
          </button>

          <button
            onClick={handleDelete}
            aria-label='Delete place'
            className='p-1 -m-1 cursor-pointer'
          >
            <MdDeleteForever
              size={22}
              className='hover:text-[#fa5252] hover:scale-110 transition-transform duration-200'
            />
          </button>
        </div>
      </div>
    </Link>
  );
}

export default PlaceItem;
