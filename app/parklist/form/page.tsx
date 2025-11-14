import { Suspense } from 'react';
import { auth } from '@/app/_lib/auth';
import Form from '@/app/_components/Form';
import Spinner from '@/app/_components/Spinner';
import { getUser } from '@/app/_lib/data-service';
import type { FormUser } from '@/app/_components/Form';

export default async function Page() {
  const session = await auth();
  const email = session?.user?.email;

  // Get user profile from Supabase
  const userProfile = await getUser(email);

  const fullName = userProfile?.fullName || session?.user?.name || 'Anonymous';

  // Create minimal user object for Form
  const userForForm: FormUser = {
    id: userProfile?.id, // optional for OAuth
    email: email || '',
    fullName,
  };

  return (
    <div className='flex items-center justify-center'>
      <Suspense fallback={<Spinner />}>
        <Form user={userForForm} userName={fullName} />
      </Suspense>
    </div>
  );
}
