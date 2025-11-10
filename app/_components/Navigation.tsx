import Link from 'next/link';
import { auth } from '../_lib/auth';
import { getUser } from '../_lib/data-service';
import NaviDropdown from './NaviDropdown';
import NaviDropdown2 from './NaviDropdown2';
import DarkModeToggle from './DarkModeToggle';

export default async function Navigation() {
  const session = await auth();
  const user = session?.user?.email ? await getUser(session.user.email) : null;
  // console.log(user);

  return (
    <nav className='text-lg hidden md:block'>
      <ul className='flex gap-7 items-center'>
        <li>
          <Link
            href='/about'
            className='relative inline-block after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-slate-800 after:scale-x-0 after:origin-right after:transition-transform after:duration-[600ms] after:ease-[cubic-bezier(0.19,1,0.22,1)] hover:after:scale-x-100 hover:after:origin-left hover:after:duration-[500ms]
            dark:after:bg-slate-50'
          >
            About
          </Link>
        </li>
        <li>
          <Link
            href='/support'
            className='relative inline-block after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-slate-800 after:scale-x-0 after:origin-right after:transition-transform after:duration-[600ms] after:ease-[cubic-bezier(0.19,1,0.22,1)] hover:after:scale-x-100 hover:after:origin-left hover:after:duration-[500ms]
            dark:after:bg-slate-50'
          >
            Support
          </Link>
        </li>
        <li>
          {session?.user?.provider === 'credentials' ? (
            <NaviDropdown2 fullName={user?.fullName} avatar={user?.avatar} />
          ) : session?.user ? (
            <NaviDropdown
              name={session?.user.name}
              image={session?.user.image}
            />
          ) : (
            <Link
              href='/login'
              className='relative inline-block after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-slate-800  after:scale-x-0 after:origin-right after:transition-transform after:duration-[600ms] after:ease-[cubic-bezier(0.19,1,0.22,1)] hover:after:scale-x-100 hover:after:origin-left hover:after:duration-[500ms]
              dark:after:bg-slate-50'
            >
              Login / Sign up
            </Link>
          )}
        </li>
        <DarkModeToggle />
      </ul>
    </nav>
  );
}
