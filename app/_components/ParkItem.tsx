'use client';

import Link from 'next/link';
import { MdDeleteForever } from 'react-icons/md';
import { IoBookmark } from 'react-icons/io5';
import { useParks } from '../_lib/contexts/ParkContext';
import { useRouter } from 'next/navigation';
import { useBookmarks } from '../_lib/contexts/BookmarkContext';
import { MouseEvent } from 'react';
import type { Park } from '@/types/park';
import type { Bookmark } from '../_lib/contexts/BookmarkContext';

interface ParkItemProps {
  park: Park;
}

const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

function ParkItem({ park }: ParkItemProps) {
  const { deletePark } = useParks();
  const { bookmarks, updateBookmark } = useBookmarks();
  const router = useRouter();

  const {
    id,
    city,
    dist,
    parkName,
    date,
    notes,
    recreation,
    position,
    image,
    starRating,
    email,
  } = park;

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    deletePark(id);
    router.refresh();
  }

  const isBookmarked = bookmarks.some(
    (bookmark: Bookmark) => bookmark.parkId === id,
  );

  async function handleToggleBookmark(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    const bookmarkData: Bookmark = {
      parkId: id,
      city,
      dist,
      parkName,
      date: String(date),
      notes,
      recreation,
      position,
      image,
      starRating,
      email,
    };

    try {
      await updateBookmark(bookmarkData);
      console.log('Bookmark toggled successfully');
      router.refresh();
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  }

  return (
    <Link
      className='flex justify-start items-center gap-3 max-w-[22rem] text-lg 1xs:text-base
     cursor-pointer no-underline m-[5px] p-[0.5rem] sm_2:p-[0.3rem] rounded-[7px] border border-slate-300  dark:shadow-accent-600 hover:border-accent-600 hover:shadow-accent-600 hover:shadow-lg transition-all duration-300'
      prefetch={false}
      href={`parklist/${id}/?lat=${position?.lat ?? 0}&lng=${
        position?.lng ?? 0
      }`}
    >
      <span className='w-[6rem] break-words'>{parkName}</span>
      <span className='max-w-[6rem]'>{formatDate(date)}</span>
      <span className='max-w-[3rem]'>{starRating} ⭐️</span>
      <button
        className='max-w-[3rem] h-[1.6rem] cursor-pointer'
        onClick={handleToggleBookmark}
      >
        <IoBookmark
          className={`hover:text-accent-400 hover:scale-125 transition-transform duration-300 ${
            isBookmarked ? 'text-accent-400 ' : ''
          }`}
          size={23}
        />
      </button>
      <button onClick={handleClick}>
        <MdDeleteForever
          className='hover:text-[#fa5252] hover:scale-125 transition-transform duration-300'
          size={25}
        />
      </button>
    </Link>
  );
}

export default ParkItem;
