import { getPark, getParkLists } from '@/app/_lib/data-service';
import Park from '@/app/_components/Park';
import { Suspense } from 'react';
import Spinner from '@/app/_components/Spinner';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const park = await getPark(params.parkId);
  return {
    title: park?.parkName ? `Park ${park.parkName}` : 'Park Detail',
  };
}

export async function generateStaticParams() {
  const { data: parkLists } = await getParkLists();
  if (!Array.isArray(parkLists)) return [];

  return parkLists.map((park) => ({ parkId: String(park.id) }));
}

export default async function Page({ params }) {
  const park = await getPark(params.parkId);

  if (!park) {
    notFound(); // ✅ This is now safe and valid
  }

  return (
    <div className='flex items-center justify-center'>
      <Suspense fallback={<Spinner />}>
        <Park park={park} />
      </Suspense>
    </div>
  );
}
