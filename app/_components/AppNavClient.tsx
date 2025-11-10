'use client';

import Link from 'next/link';
import Sort from './Sort';
import Search from './Search';
import { usePathname } from 'next/navigation';

function AppNavClient() {
  const pathname = usePathname(); // Get the current route dynamically

  return (
    <nav className='mx-auto min-w-[23rem] px-1 mb-2 md:mb-0 text-xs font-bold'>
      <div className='flex justify-center'>
        <ul className='hidden md:flex justify-center h-10'>
          <li className='flex' dir='ltr'>
            <Link
              href='/parklist'
              className={`flex items-center justify-center no-underline uppercase px-2 rounded-s-lg transition-all duration-300 border border-slate-300 ${
                pathname === '/parklist'
                  ? ' border-none bg-accent-600 text-slate-50 shadow-lg' // Active state
                  : ' hover:bg-accent-600 hover:text-slate-50'
              }`}
            >
              Park List
            </Link>
          </li>
          <li className='flex' dir='rtl'>
            <Link
              href='/parklist/bookmarks'
              className={`flex items-center no-underline uppercase px-2 mr-2 rounded-s-lg transition-all duration-300 border border-slate-300 ${
                pathname === '/parklist/bookmarks'
                  ? ' border-none bg-accent-600 text-slate-50 shadow-lg ' // Active state
                  : '  hover:bg-accent-600 hover:text-slate-50'
              }`}
            >
              Bookmarks
            </Link>
          </li>
        </ul>
        <Sort />
        <Search />
      </div>
    </nav>
  );
}

export default AppNavClient;
