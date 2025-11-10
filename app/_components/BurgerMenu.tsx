'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import SignOutButton from './SignOutButton';
import { RxHamburgerMenu, RxCross2 } from 'react-icons/rx';
import { useSession } from 'next-auth/react';
import DarkModeToggle from './DarkModeToggle';

export default function BurgerMenu() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const { data: session } = useSession(); // <- 🔑 Use session directly
  const user = session?.user;
  // console.log(user);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='relative z-[9999] md:hidden'>
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className={`fixed z-[9999] right-9 top-7 border-none bg-none ${
          open ? 'hidden' : ''
        }`}
      >
        <RxHamburgerMenu className='fixed w-7 h-7 right-10 top-6' />
      </button>

      {open && (
        <div className='fixed w-full h-full bg-[rgba(0,0,0,0.7)] z-[9998] left-0 top-0'>
          <ul
            ref={dropdownRef}
            className='absolute top-0 right-0 pt-[10rem] w-[40%] h-full bg-slate-200 text-slate-700 text-xl z-50'
          >
            <RxCross2
              onClick={() => setOpen(false)}
              className='fixed z-50 cursor-pointer w-7 h-7 right-10 top-5'
            />
            <div className='fixed z-50 cursor-pointer w-7 h-7 right-[6rem] top-4'>
              <DarkModeToggle />
            </div>

            {[
              { href: '/', label: 'Home' },
              { href: '/about', label: 'About' },
              { href: '/support', label: 'Support' },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className='flex justify-end px-10 py-2 text-sm'
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}

            {!user && (
              <>
                <div className='flex justify-end mt-5 mb-5 pr-10'>
                  <div className='w-[80%] border-t-[1px] border-slate-400'></div>
                </div>
                {[
                  { href: '/login', label: 'Login' },
                  { href: '/register', label: 'Sign up' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className='flex justify-end px-10 py-2 text-sm'
                      onClick={() => setOpen(false)}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </>
            )}

            {user && (
              <>
                {[
                  { href: '/dashboard', label: 'Dashboard' },
                  { href: '/dashboard/profile', label: 'Profile' },
                  { href: '/dashboard/credentials', label: 'Credentials' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className='flex justify-end px-10 py-2 text-sm'
                      onClick={() => setOpen(false)}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
                <div className='flex justify-end mt-5 pr-10'>
                  <div className='w-[80%] border-t-[1px] border-slate-400'></div>
                </div>
                <li>
                  <SignOutButton />
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
