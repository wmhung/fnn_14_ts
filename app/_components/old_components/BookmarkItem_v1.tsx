'use client';

import Link from 'next/link';
import { useBookmarks } from '../../_lib/contexts/BookmarkContext';
import { useRouter } from 'next/navigation';
import { IoBookmark } from 'react-icons/io5';

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

function BookmarkItem({ bookmark }) {
  const router = useRouter();
  const { deleteBookmark } = useBookmarks();

  const { id, parkName, date, parkId, position, starRating } = bookmark;

  const handleRemove = async (e) => {
    e.preventDefault();
    try {
      await deleteBookmark(id);
      router.refresh();
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  return (
    <>
      <Link
        className='flex justify-start items-center gap-3 max-w-[22rem] text-sm cursor-pointer no-underline m-[5px] p-[0.5rem] sm_2:p-[0.3rem] rounded-[7px] border border-slate-300  dark:shadow-accent-600 hover:border-accent-600 hover:shadow-accent-600 hover:shadow-lg transition-all duration-300'
        prefetch={false}
        href={`/parklist/${parkId}/?lat=${position?.lat ?? 0}&lng=${
          position?.lng ?? 0
        }`}
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
    </>
  );
}

export default BookmarkItem;
