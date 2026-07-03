'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import SignOutButtonDesktop from './SignOutButtonDesktop';
import { RxCross2 } from 'react-icons/rx';
import Image from 'next/image';

export default function NaviDropdown2({ fullName, avatar }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null); // <--- Create a ref

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className='flex items-center gap-3'
      >
        <div className='w-10 h-10 rounded-full overflow-hidden relative'>
          <Image
            src={avatar}
            alt='user icon'
            fill
            className='object-cover'
            referrerPolicy='no-referrer'
            sizes='40px'
          />
        </div>
        <span className='relative inline-block after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-neutral-700 after:scale-x-0 after:origin-right after:transition-transform after:duration-[600ms] after:ease-[cubic-bezier(0.19,1,0.22,1)] hover:after:scale-x-100 hover:after:origin-left hover:after:duration-[500ms] [word-spacing:0.5rem] dark:after:bg-slate-50'>
          {fullName}&#39;s account
        </span>
      </button>

      {open && (
        <div className='fixed w-full h-full bg-[rgba(0,0,0,0.7)] z-20 left-0 top-0'>
          <ul
            ref={dropdownRef}
            className='absolute top-0 right-0 pt-[10rem] w-[25%] h-full bg-slate-200 text-slate-700 text-xl z-10'
          >
            <RxCross2
              onClick={() => setOpen(!open)}
              className='fixed z-10 cursor-pointer w-7 h-7 right-12 top-8'
            />
            <li>
              <Link
                href='/dashboard'
                onClick={() => setOpen(false)}
                className='flex justify-end px-12 py-2 hover:font-black hover:text-2xl transition-all duration-300'
              >
                <p>Dashboard</p>
              </Link>
            </li>
            <li>
              <Link
                href='/dashboard/profile'
                onClick={() => setOpen(false)}
                className='flex justify-end px-12 py-2 hover:font-black hover:text-2xl transition-all duration-300'
              >
                <p>Profile</p>
              </Link>
            </li>
            <li>
              <Link
                href='/dashboard/credentials'
                onClick={() => setOpen(false)}
                className='flex justify-end px-12 py-2 hover:font-black hover:text-2xl transition-all duration-300'
              >
                <p>Credentials</p>
              </Link>
            </li>
            <div className='flex justify-end mt-5 px-12'>
              <div className='w-[90%] border-t-[1px] border-slate-400'></div>
            </div>
            <li>
              <SignOutButtonDesktop />
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
