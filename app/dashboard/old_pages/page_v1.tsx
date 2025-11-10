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
import { PiParkDuotone } from 'react-icons/pi';
import { FaRegImages } from 'react-icons/fa';
import { BsBookmarkStarFill } from 'react-icons/bs';
import { FaStar } from 'react-icons/fa';

import LoginMessage from '../_components/LoginMessage';
import UserTable from '../_components/UserTable';

// page title
export const metadata = {
  title: 'Dashboard',
};

export default async function Page() {
  // get user data from session
  const session = await auth();
  const name = session?.user?.name;
  const email = session?.user?.email;
  // get user data from supabase
  const user = await getUser(email);
  const userName = user?.fullName;
  const role = user.role;

  const usersData = await getUsersData();

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
  let plural = 0;

  if (count <= 1) {
    plural = null;
  } else {
    plural = 's';
  }

  // average operation
  const average = (arr) => arr.reduce((acc, cur) => acc + cur, 0) / arr.length;

  let ratings = [];
  // if the user's role is owner or admin, fetch all users' ratings
  if (role === 'owner') {
    ratings = await getAppRating();
  } else {
    ratings = await getRating(email);
  }

  const avgRating = ratings.length
    ? average(
        ratings.map(
          (rating) =>
            role === 'owner'
              ? rating.appRating // from `feedbacks`
              : rating.starRating // from `parklist`
        )
      )
    : 0;

  const avgRatingRounded = Number(avgRating).toFixed(1);

  return (
    <div className='mx-auto pb-4'>
      {session?.user.email ? (
        <div className='mx-auto'>
          <h1 className='flex justify-start items-center my-8 px-2 text-xl'>
            Hi, {name ? name : userName}.{' '}
            {role === 'owner' ? 'All users have...' : 'You have...'}
          </h1>

          <div className='grid grid-cols-2 gap-4 xs:grid-cols-4 xs:gap-2 2xs:gap-1 px-2 max-w-[60rem] [10rem] mx-auto text-base'>
            <div className='flex flex-col justify-center items-center py-2  rounded-lg shadow-lg bg-[linear-gradient(to_left_top,_#e8e0ec,_#ddbdef,_#cf9af1,_#bf76f3,_#ab4ef4)] px-1'>
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
              {role === 'owner' ? (
                <span className='items-center text-center'>
                  reviewed the app <br />
                  avg: {avgRatingRounded}
                </span>
              ) : (
                <span className='items-center text-center'>
                  rated places
                  <br />
                  avg: {avgRatingRounded}
                </span>
              )}
            </div>
          </div>
          <div className='hidden md:block'>
            {role === 'owner' || role === 'admin' ? (
              <UserTable users={usersData} currentUserEmail={email} />
            ) : (
              ''
            )}
          </div>
        </div>
      ) : (
        <LoginMessage />
      )}
    </div>
  );
}
