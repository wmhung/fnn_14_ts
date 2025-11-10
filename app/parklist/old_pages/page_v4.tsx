import { auth } from '@/app/_lib/auth';
import { getBookmarkLists, getParkLists } from '../_lib/data-service';
import LoginMessage from '../_components/LoginMessage';
import ParkLayout from '@/app/_components/ParkLayout';
import ParkLayoutMobile from '../_components/ParkLayoutMobile';
import { MobilePanelProvider } from '../_lib/contexts/MobilePanelContext';
import { ParkDataProvider } from '../_lib/contexts/ParkDataContext';
import HydratedWrapper from '../_components/HydratedWrapper';

export const revalidate = 0;

export const metadata = {
  title: 'Park List',
};

export default async function Page({ searchParams }: any) {
  const session = await auth();
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
        {/* Desktop floating panel */}
        <HydratedWrapper className='absolute top-20 left-4 max-w-[23rem] max-h-[82%] p-3 hidden md:block z-10 rounded-lg shadow-xl bg-slate-50 dark:bg-slate-800 overflow-hidden'>
          <ParkLayout data={data} />
        </HydratedWrapper>

        {/* Mobile floating panel */}
        <HydratedWrapper className='absolute bottom-0 left-0 right-0 h-[60%] md:hidden z-10 rounded-t-lg shadow-xl bg-slate-50 dark:bg-slate-800 overflow-hidden'>
          <ParkLayoutMobile data={data} />
        </HydratedWrapper>
      </ParkDataProvider>
    </MobilePanelProvider>
  );
}
