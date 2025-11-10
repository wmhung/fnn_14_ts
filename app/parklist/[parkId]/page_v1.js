import { getPark, getParkLists } from '@/app/_lib/data-service';
import Park from '@/app/_components/Park';
import { Suspense } from 'react';
import Spinner from '@/app/_components/Spinner';

export async function generateMetadata({ params }) {
  const { name } = await getPark(params.parkId);
  return { title: `Park ${name}` };
}

export async function generateStaticParams() {
  const { data: parkLists } = await getParkLists();
  const ids = parkLists.map((park) => ({ parkId: String(park.id) }));
  console.log(ids);

  return ids;
}

export default async function Page({ params }) {
  const park = await getPark(params.parkId);
  return (
    <div className='flex items-center justify-center'>
      <Suspense fallback={<Spinner />}>
        <Park park={park} />
      </Suspense>
    </div>
  );
}
