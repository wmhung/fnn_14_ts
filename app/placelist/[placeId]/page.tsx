import { getPlace as fetchPlace, getPlaceLists } from '@/app/_lib/data-service';
import Place from '@/app/_components/Place';
import { Suspense, cache } from 'react';
import Spinner from '@/app/_components/Spinner';
import { notFound } from 'next/navigation';
import { auth } from '@/app/_lib/auth';
import LoginMessage from '@/app/_components/LoginMessage';

export const dynamic = 'force-dynamic';

const getPlace = cache((id: Parameters<typeof fetchPlace>[0]) =>
  fetchPlace(id),
);

export async function generateMetadata({ params }) {
  const place = await getPlace(params.placeId);
  return {
    title: place?.place_name ? `Place ${place.place_name}` : 'Place Detail',
  };
}

export async function generateStaticParams() {
  const { data: placeLists } = await getPlaceLists();
  if (!Array.isArray(placeLists)) return [];

  return placeLists.map((place) => ({ placeId: String(place.id) }));
}

export default async function Page({ params }) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) return <LoginMessage />;

  const place = await getPlace(params.placeId);

  if (!place) {
    notFound();
  }

  if (place.email !== email) {
    notFound();
  }

  return (
    <div className='flex items-center justify-center'>
      <Suspense fallback={<Spinner />}>
        <Place place={place} />
      </Suspense>
    </div>
  );
}
