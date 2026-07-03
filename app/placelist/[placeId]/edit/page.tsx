import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { auth } from '@/app/_lib/auth';
import { getPlace, getUser } from '@/app/_lib/data-service';
import Form from '@/app/_components/Form';
import Spinner from '@/app/_components/Spinner';
import LoginMessage from '@/app/_components/LoginMessage';
import type { FormUser } from '@/app/_components/Form';
import type { Place } from '@/types/place';

interface EditPageProps {
  params: { placeId: string };
}

export const metadata = {
  title: 'Edit Place',
};

export default async function Page({ params }: EditPageProps) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) return <LoginMessage />;

  const placeId = Number(params.placeId);
  if (Number.isNaN(placeId)) notFound();

  //  1. load the place
  const place = await getPlace(placeId);
  if (!place) notFound();

  // 2. SERVER-SIDE OWNERSHIP CHECK Never trust the client.
  if (place.email !== email) notFound();

  // 3. user profile lookup — same as create-form page
  const userProfile = await getUser(email);
  const full_name =
    userProfile?.full_name || session?.user?.name || 'Anonymous';

  const userForForm: FormUser = {
    id: userProfile?.id,
    email,
    full_name,
  };

  return (
    <div className='flex items-center justify-center'>
      <Suspense fallback={<Spinner />}>
        <Form
          mode='edit'
          initialPlace={place as Place}
          user={userForForm}
          user_name={full_name}
        />
      </Suspense>
    </div>
  );
}
