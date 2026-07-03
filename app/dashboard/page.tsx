import { auth } from '../_lib/auth';
import {
  getBookmarksCount,
  getPhotosCount,
  getPlaceLists,
  getAppRating,
  getRating,
  getUsersData,
  getUser,
} from '../_lib/data-service';
import type { User } from '@/types/user';
import { PiParkDuotone } from 'react-icons/pi';
import { FaRegImages, FaStar } from 'react-icons/fa';
import { BsBookmarkStarFill } from 'react-icons/bs';

import LoginMessage from '../_components/LoginMessage';
import UserTable from '../_components/UserTable';

// page title
export const metadata = {
  title: 'Dashboard',
};

// Helper to calculate average
const average = (arr: number[]) =>
  arr.reduce((acc, cur) => acc + cur, 0) / arr.length;

export default async function Page() {
  // get user data from session
  const session = await auth();
  const name = session?.user?.name;
  const email = session?.user?.email;

  // get user data from supabase
  const user = email ? await getUser(email) : null;
  const userName = user?.full_name;
  const role = user?.role;

  // ✅ Type usersData as User[]
  const usersData: User[] =
    role === 'owner' || role === 'admin' ? await getUsersData() : [];

  // retrieve place and bookmark count
  let count = 0;
  let count_2 = 0;
  let count_3 = 0;

  if (email) {
    const result = await getPlaceLists({ email });
    const result_2 = await getBookmarksCount(email);
    const result_3 = await getPhotosCount(email);
    count = result.count || 0;
    count_2 = result_2.count || 0;
    count_3 = result_3.count || 0;
  }

  // add 's' after plural noun
  let plural: string | null = null;
  if (count > 1) plural = 's';

  // fetch ratings
  let ratings: any[] = [];
  if (role === 'owner') {
    ratings = await getAppRating();
  } else if (email) {
    ratings = await getRating(email);
  }

  const avgRating =
    ratings.length > 0
      ? average(
          ratings.map((rating) =>
            role === 'owner' ? rating.app_rating : rating.star_rating,
          ),
        )
      : 0;

  // round to 1 decimal and keep as number
  const avgRatingRounded = Math.round(avgRating * 10) / 10;

  return (
    <div className='mx-auto pb-4'>
      {session?.user?.email ? (
        <div className='mx-auto'>
          <h1 className='flex justify-start items-center my-8 px-2 text-xl'>
            Hi, {name || userName}.{' '}
            {role === 'owner' ? 'All users have...' : 'You have...'}
          </h1>

          <div className='grid grid-cols-2 gap-4 xs:grid-cols-4 xs:gap-3 2xs:gap-2 px-2 max-w-[60rem] mx-auto'>
            <div className='flex flex-col items-center text-center py-5 px-3 rounded-xl shadow-md bg-white border-t-4 border-emerald-400 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 dark:bg-slate-800 dark:ring-1 dark:ring-slate-700 dark:shadow-none dark:hover:ring-slate-600 dark:border-emerald-500'>
              <PiParkDuotone className='w-9 h-8 text-emerald-500 dark:text-emerald-400 mb-2' />
              <p className='text-3xl font-bold text-gray-900 leading-none dark:text-slate-100'>
                {count}
              </p>
              <p className='mt-2 text-[0.7rem] uppercase tracking-wider text-gray-500 dark:text-slate-400'>
                place{plural} visited
              </p>
            </div>
            <div className='flex flex-col items-center text-center py-5 px-3 rounded-xl shadow-md bg-white border-t-4 border-amber-400 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 dark:bg-slate-800 dark:ring-1 dark:ring-slate-700 dark:shadow-none dark:hover:ring-slate-600 dark:border-amber-500'>
              <BsBookmarkStarFill className='w-8 h-8 text-amber-500 dark:text-amber-400 mb-2' />
              <p className='text-3xl font-bold text-gray-900 leading-none dark:text-slate-100'>
                {count_2}
              </p>
              <p className='mt-2 text-[0.7rem] uppercase tracking-wider text-gray-500 dark:text-slate-400'>
                bookmark{plural} saved
              </p>
            </div>
            <div className='flex flex-col items-center text-center py-5 px-3 rounded-xl shadow-md bg-white border-t-4 border-sky-400 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 dark:bg-slate-800 dark:ring-1 dark:ring-slate-700 dark:shadow-none dark:hover:ring-slate-600 dark:border-sky-500'>
              <FaRegImages className='w-8 h-8 text-sky-500 dark:text-sky-400 mb-2' />
              <p className='text-3xl font-bold text-gray-900 leading-none dark:text-slate-100'>
                {count_3}
              </p>
              <p className='mt-2 text-[0.7rem] uppercase tracking-wider text-gray-500 dark:text-slate-400'>
                photo{plural} uploaded
              </p>
            </div>
            <div className='flex flex-col items-center text-center py-5 px-3 rounded-xl shadow-md bg-white border-t-4 border-rose-400 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 dark:bg-slate-800 dark:ring-1 dark:ring-slate-700 dark:shadow-none dark:hover:ring-slate-600 dark:border-rose-500'>
              <FaStar className='w-8 h-8 text-rose-500 dark:text-rose-400 mb-2' />
              <p className='text-3xl font-bold text-gray-900 leading-none dark:text-slate-100'>
                {avgRatingRounded}
              </p>
              <p className='mt-2 text-[0.7rem] uppercase tracking-wider text-gray-500 dark:text-slate-400'>
                {role === 'owner' ? 'avg app rating' : 'avg place rating'}
              </p>
            </div>
          </div>

          <div>
            {(role === 'owner' || role === 'admin') && (
              <UserTable users={usersData} currentUserEmail={email} />
            )}
          </div>
        </div>
      ) : (
        <LoginMessage />
      )}
    </div>
  );
}
