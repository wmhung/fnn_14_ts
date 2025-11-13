import UpdateProfileForm from '@/app/_components/UpdateProfileForm';
import { auth } from '@/app/_lib/auth';
import { getUser } from '@/app/_lib/data-service';

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

  return (
    <div className='mx-auto my-auto'>
      <h1 className='flex mb-3 justify-center text-2xl'>Update your profile</h1>

      <UpdateProfileForm user={user} />
    </div>
  );
}
