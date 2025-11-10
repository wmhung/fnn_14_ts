'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { MdOutlineSort } from 'react-icons/md';

const sortOptions = [
  { label: 'Recent First', value: 'date-desc' },
  { label: 'Earlier First', value: 'date-asc' },
  { label: 'Highest Rating', value: 'rating-desc' },
  { label: 'Lowest Rating', value: 'rating-asc' },
];

function Sort() {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeSort = searchParams.get('sort') ?? 'date-desc';

  function handleSort(selectedSort: string) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('sort', selectedSort);
    params.set('page', '1');

    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='relative flex flex-shrink-0 text-sm ml-2' ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className='flex items-center gap-1 px-2 w-[3rem] border border-slate-300 text-slate-400 rounded-md shadow-sm bg-transparent hover:border-accent-600 dark:text-slate-400 transition-all duration-300'
        aria-haspopup='true'
        aria-expanded={open}
      >
        <MdOutlineSort className='w-4 h-6' />
        <ChevronDown className='w-4 h-4' />
      </button>

      {open && (
        <ul className='absolute top-8 left-0 mt-2 w-40 border border-slate-400 bg-slate-50 rounded-md shadow-lg z-50'>
          {sortOptions.map((option) => (
            <li key={option.value}>
              <button
                onClick={() => handleSort(option.value)}
                className={`block w-full text-left px-4 py-2 hover:bg-accent-100 ${
                  activeSort === option.value
                    ? 'font-semibold text-accent-600'
                    : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Sort;
