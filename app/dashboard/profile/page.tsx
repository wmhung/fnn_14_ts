import UpdateProfileForm from '@/app/_components/UpdateProfileForm';
import { auth } from '@/app/_lib/auth';
import { getUser } from '@/app/_lib/data-service';
import type { UpdateUser } from '@/types/user';
import LoginMessage from '@/app/_components/LoginMessage';

export const metadata = {
  title: 'Update profile',
};

export default async function Page() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) return <LoginMessage />;

  const user = await getUser(session?.user.email);

  if (!user) {
    return (
      <div className='mx-auto my-auto'>
        <h1 className='flex mb-3 justify-center text-2xl'>User not found</h1>
      </div>
    );
  }

  // OAuth users get their avatar from the provider (read-only);
  // credentials users get it from the DB (editable).
  const provider = session?.user?.provider ?? null;
  const isOAuth = provider === 'google' || provider === 'github';

  // Map user to UpdateUser type
  const updateUser: UpdateUser = {
    full_name: user.full_name,
    email: user.email,
    role: user.role === 'user' || user.role === 'owner' ? user.role : 'user', // fallback for admin
    avatar: isOAuth ? session?.user?.image ?? user.avatar : user.avatar,
    gender: user.gender,
    num_of_kids: user.num_of_kids,
  };

  return (
    <div className='w-full mx-auto my-auto px-3 sm:px-6 py-4 sm:py-6'>
      <h1 className='flex mb-4 sm:mb-6 justify-center text-xl sm:text-2xl font-semibold'>
        Update your profile
      </h1>

      <UpdateProfileForm user={updateUser} provider={provider} />
    </div>
  );
}
