import { auth } from '../_lib/auth';
import {
  getBookmarksCount,
  getPhotosCount,
  getParkLists,
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
  const userName = user?.fullName;
  const role = user?.role;

  // ✅ Type usersData as User[]
  const usersData: User[] =
    role === 'owner' || role === 'admin' ? await getUsersData() : [];

  // retrieve park and bookmark count
  let count = 0;
  let count_2 = 0;
  let count_3 = 0;

  if (email) {
    const result = await getParkLists({ email });
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
            role === 'owner' ? rating.appRating : rating.starRating
          )
        )
      : 0;

  // round to 1 decimal and keep as number
  const avgRatingRounded = Math.round(avgRating * 10) / 10;

  return (
    <div className='mx-auto pb-4'>
      {session?.user.email ? (
        <div className='mx-auto'>
          <h1 className='flex justify-start items-center my-8 px-2 text-xl'>
            Hi, {name || userName}.{' '}
            {role === 'owner' ? 'All users have...' : 'You have...'}
          </h1>

          <div className='grid grid-cols-2 gap-4 xs:grid-cols-4 xs:gap-2 2xs:gap-1 px-2 max-w-[60rem] mx-auto text-base'>
            <div className='flex flex-col justify-center items-center py-2 rounded-lg shadow-lg bg-[linear-gradient(to_left_top,_#e8e0ec,_#ddbdef,_#cf9af1,_#bf76f3,_#ab4ef4)] px-1'>
              <PiParkDuotone className='mx-2 w-10 h-10' />
              <span className='items-center text-center'>
                visited <br />
                {count} park{plural}
              </span>
            </div>
            <div className='flex flex-col justify-center items-center py-2 rounded-lg shadow-lg bg-[linear-gradient(to_right_top,_#e8e0ec,_#ddbdef,_#cf9af1,_#bf76f3,_#ab4ef4)] px-1'>
              <BsBookmarkStarFill className='mx-2 my-1 w-7 h-7' />
              <span className='items-center text-center'>
                saved <br />
                {count_2} bookmark{plural}
              </span>
            </div>
            <div className='flex flex-col justify-center items-center py-2 rounded-lg shadow-lg bg-[linear-gradient(to_left_bottom,_#e8e0ec,_#ddbdef,_#cf9af1,_#bf76f3,_#ab4ef4)] px-1'>
              <FaRegImages className='mx-2 my-1 w-8 h-8' />
              <span className='items-center text-center'>
                uploaded <br />
                {count_3} photo{plural}
              </span>
            </div>
            <div className='flex flex-col justify-center items-center py-2 rounded-lg shadow-lg bg-[linear-gradient(to_right_bottom,_#e8e0ec,_#ddbdef,_#cf9af1,_#bf76f3,_#ab4ef4)] px-1'>
              <FaStar className='mx-2 my-1 w-8 h-8' />
              <span className='items-center text-center'>
                {role === 'owner' ? 'reviewed the app' : 'rated places'}
                <br />
                avg: {avgRatingRounded}
              </span>
            </div>
          </div>

          <div className='hidden md:block'>
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
