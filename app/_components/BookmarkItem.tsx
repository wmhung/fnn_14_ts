'use client';

import Link from 'next/link';
import { useBookmarks } from '../_lib/contexts/BookmarkContext';
import { usePlaces } from '../_lib/contexts/PlaceContext';
import { useRouter } from 'next/navigation';
import { IoBookmark } from 'react-icons/io5';
import type { Bookmark } from '@/types/place';
import { useSession } from 'next-auth/react';

import React from 'react';

interface BookmarkItemProps {
  bookmark: Bookmark;
}

const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export default function BookmarkItem({ bookmark }: BookmarkItemProps) {
  const router = useRouter();
  const { toggleBookmark } = useBookmarks();
  const { getPlace } = usePlaces();
  const { data: session } = useSession(); // [ADD]

  const {
    id,
    place_name: placeName,
    date,
    place_id,
    position,
    star_rating: starRating,
  } = bookmark;

  const handleRemove = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const email = session?.user?.email;
    if (!email) return;

    try {
      await toggleBookmark(place_id, email);
      router.refresh();
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  function handleClick() {
    getPlace(place_id);
  }

  return (
    <Link
      onClick={handleClick}
      prefetch={false}
      href={`/placelist/${place_id}/?lat=${position?.lat ?? 0}&lng=${
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

      {/* ROW 2: rating (left) + remove action (right) */}
      <div className='flex items-center justify-between'>
        <span className='text-sm'>{starRating ? `${starRating} ⭐️` : '—'}</span>

        <div className='flex items-center gap-3'>
          <button
            onClick={handleRemove}
            aria-label='Remove bookmark'
            className='p-1 -m-1 cursor-pointer'
          >
            <IoBookmark
              size={20}
              className='text-accent-400 hover:text-accent-500 hover:scale-110 transition-transform duration-200'
            />
          </button>
        </div>
      </div>
    </Link>
  );
}
