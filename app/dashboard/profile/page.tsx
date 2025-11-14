import UpdateProfileForm from '@/app/_components/UpdateProfileForm';
import { auth } from '@/app/_lib/auth';
import { getUser } from '@/app/_lib/data-service';
import type { UpdateUser } from '@/types/user';

export const metadata = {
  title: 'Update profile',
};

export default async function Page() {
  const session = await auth();
  const user = await getUser(session?.user.email);

  if (!user) {
    return (
      <div className='mx-auto my-auto'>
        <h1 className='flex mb-3 justify-center text-2xl'>User not found</h1>
      </div>
    );
  }

  // Map user to UpdateUser type
  const updateUser: UpdateUser = {
    fullName: user.fullName,
    email: user.email,
    role: user.role === 'user' || user.role === 'owner' ? user.role : 'user', // fallback for admin
    avatar: (user as any).image,
    gender: (user as any).gender,
    numOfKids: (user as any).numOfKids,
  };

  return (
    <div className='mx-auto my-auto'>
      <h1 className='flex mb-3 justify-center text-2xl'>Update your profile</h1>

      <UpdateProfileForm user={updateUser} />
    </div>
  );
}
