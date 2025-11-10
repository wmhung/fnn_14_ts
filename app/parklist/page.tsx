import { auth } from '@/app/_lib/auth';
import { getParkLists, getBookmarkLists } from '../_lib/data-service';
import ParkLayoutFloating from '../_components/ParkLayoutFloating';
import LoginMessage from '../_components/LoginMessage';

export const revalidate = 0;
// page title for seo
export const metadata = {
  title: 'Park List',
};

export default async function Page({ searchParams }: any) {
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
    <div>
      <ParkLayoutFloating initialData={data} />
    </div>
  );
}
