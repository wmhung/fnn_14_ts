import { auth } from '@/app/_lib/auth';
import { getBookmarkLists, getParkLists } from '../_lib/data-service';

import LoginMessage from '../_components/LoginMessage';
import ParkLayout from '@/app/_components/ParkLayout'; // new client component
import { MobilePanelProvider } from '../_lib/contexts/MobilePanelContext';
import { ParkDataProvider } from '../_lib/contexts/ParkDataContext';
import ParkLayoutMobile from '../_components/ParkLayoutMobile';

export const revalidate = 0;
// page title for seo
export const metadata = {
  title: 'Park List',
};

export default async function Page({ searchParams }) {
  const session = await auth();
  // console.log(session);
  const email = session?.user?.email;

  if (!email) return <LoginMessage />;

  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const query = searchParams?.query ?? '';
  const sort = searchParams?.sort ?? 'date-desc';

  const { data: parkLists, count } = await getParkLists({
    page,
    query,
    sort,
    email,
  });

  const { data: bookmarkLists } = await getBookmarkLists({ email });

  const data = { parkLists, bookmarkLists, sort, query, page, count };

  return (
    <MobilePanelProvider>
      <ParkDataProvider value={data}>
        {/* Desktop */}
        <div className='absolute max-w-[23rem] max-h-[82%] py-3 top-[5rem] left-[1rem] bottom-[5px] hidden md:block z-10 rounded-lg shadow-xl bg-slate-50 dark:bg-slate-800'>
          <ParkLayout data={data} />
        </div>
        {/* Mobile */}
        <div className='md:hidden'>
          <ParkLayoutMobile data={data} />
        </div>
      </ParkDataProvider>
    </MobilePanelProvider>
  );
}
