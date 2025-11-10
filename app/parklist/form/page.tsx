import { Suspense } from 'react';
import { auth } from '@/app/_lib/auth';
import Form from '@/app/_components/Form';
import Spinner from '@/app/_components/Spinner';
import { getUser } from '@/app/_lib/data-service';

export default async function Page() {
  const session = await auth();
  // get google/github auth user's name from session
  const email = session?.user?.email;

  // get email login user's name from supabase
  const userProfile = await getUser(email);
  const fullName = userProfile?.fullName || 'Anonymous';

  return (
    <div className='flex items-center justify-center'>
      <Suspense fallback={<Spinner />}>
        <Form user={session.user} userName={fullName} />
      </Suspense>
    </div>
  );
}
