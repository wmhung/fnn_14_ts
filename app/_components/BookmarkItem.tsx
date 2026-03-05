'use client';

import Link from 'next/link';
import { useBookmarks } from '../_lib/contexts/BookmarkContext';
import { useParks } from '../_lib/contexts/ParkContext';
import { useRouter } from 'next/navigation';
import { IoBookmark } from 'react-icons/io5';
import type { Bookmark } from '@/types/park';
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
  const { deleteBookmark } = useBookmarks();
  const { getPark } = useParks();
  const { id, parkName, date, parkId, position, starRating } = bookmark;

  const handleRemove = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await deleteBookmark(id);
      router.refresh();
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  function handleClick() {
    getPark(bookmark.parkId);
  }

  return (
    <Link
      //  event handler on the Link component
      onClick={handleClick}
      href={`/parklist/${parkId}/?lat=${position?.lat ?? 0}&lng=${
        position?.lng ?? 0
      }`}
      prefetch={false}
      className='flex justify-start items-center gap-3 max-w-[22rem] text-lg 1xs:text-base cursor-pointer no-underline m-[6px] p-[0.3rem] sm_2:p-[0.3rem] rounded-[7px] border border-slate-300 dark:shadow-accent-600 hover:border-accent-600 hover:shadow-accent-600 hover:shadow-lg transition-all duration-300'
    >
      <span className='w-[6rem] break-words'>{parkName}</span>
      <span className='min-w-[6rem]'>{formatDate(date)}</span>
      <span className='min-w-[2rem]'>{starRating} ⭐️</span>
      <button
        className='min-w-[2rem] h-[1.6rem] cursor-pointer'
        onClick={handleRemove}
        aria-label='Remove Bookmark'
      >
        <IoBookmark
          className='text-accent-400 hover:scale-125 transition-transform duration-300'
          size={23}
        />
      </button>
    </Link>
  );
}
