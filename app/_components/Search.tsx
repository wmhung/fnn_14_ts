'use client';

import { useState, useEffect, useRef } from 'react';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function Search() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleSearch = useDebouncedCallback((term) => {
    const currentQuery = searchParams.get('query') ?? '';
    if (term === currentQuery) return;

    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    params.set('page', '1'); // reset pagination
    router.replace(`${pathname}?${params.toString()}`); // don't pollute history
  }, 1000);

  useEffect(() => {
    function handleClickOutside(e) {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setIsFocused(false);
        inputRef.current.value = ''; // Clear input text
        handleSearch(''); // Clear search query in URL
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleSearch]);

  return (
    <div className='relative flex flex-shrink-0 text-sm ml-2'>
      <label htmlFor='search' className='sr-only'>
        Search
      </label>
      <input
        className={`peer block ${
          isFocused ? 'max-w-[9rem]' : 'max-w-[3rem]'
        } transition-all duration-300 mr-2 rounded-md inset-shadow-2xs border border-1 border-slate-300 bg-transparent py-2 pl-10 outline-accent-600 placeholder:text-gray-500`}
        placeholder={isFocused ? 'Search' : ''}
        ref={inputRef}
        onFocus={() => setIsFocused(true)}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}
      />
      <HiMagnifyingGlass className='absolute left-4 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-500' />
    </div>
  );
}
