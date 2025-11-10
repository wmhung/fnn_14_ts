'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { PAGE_SIZE } from '../_lib/utils/constants';

function Pagination({ count }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentPage = Number(searchParams.get('page') || '1');
  const pageCount = Math.ceil(count / PAGE_SIZE);

  function goToPage(targetPage) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', targetPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function nextPage() {
    if (currentPage < pageCount) {
      goToPage(currentPage + 1);
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }

  if (pageCount <= 1) return null;

  return (
    <div className='max-w-[28rem] flex flex-col items-center mx-auto mt-2 md:m-2 text-sm sm:text-base'>
      <div className='hidden sm:flex'>
        <p>
          Showing <span>{(currentPage - 1) * PAGE_SIZE + 1}</span> to{' '}
          <span>
            {currentPage === pageCount ? count : currentPage * PAGE_SIZE}
          </span>{' '}
          of <span>{count}</span> results
        </p>
      </div>

      <div className='flex justify-center gap-[0.6rem]'>
        <button
          className='flex items-center gap-[0.4rem] transition-all duration-[0.3s] px-[1rem] py-[0.3rem] rounded-md hover:bg-accent-600 hover:text-primary-50 disabled:text-gray-500 disabled:hover:bg-transparent'
          onClick={prevPage}
          disabled={currentPage === 1}
        >
          <HiChevronLeft />
          <span>Previous</span>
        </button>

        <button
          className='flex items-center gap-[0.4rem] transition-all duration-300 px-[1rem] py-[0.3rem] rounded-md hover:bg-accent-600 hover:text-primary-50 disabled:text-gray-500 disabled:hover:bg-transparent'
          onClick={nextPage}
          disabled={currentPage === pageCount}
        >
          <span>Next</span>
          <HiChevronRight />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
