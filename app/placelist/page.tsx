import { auth } from '@/app/_lib/auth';
import { getPlaceLists, getBookmarkLists } from '../_lib/data-service';
import PlaceLayoutFloating from '../_components/PlaceLayoutFloating';
import LoginMessage from '../_components/LoginMessage';

export const revalidate = 0;
export const metadata = {
  title: 'Place List',
};

const PAGE_SIZE = 8; // same as your data-service PAGE_SIZE

export default async function Page({ searchParams }: any) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) return <LoginMessage />;

  const page = Number(searchParams?.page) || 1;
  const query = searchParams?.query ?? '';
  const sort = searchParams?.sort ?? 'date-desc';

  // split sort into sortBy and sortOrder
  const [sortBy, sortOrder] = sort.split('-');

  // fetch place list
  const { data: placeLists, count: placeCount } = await getPlaceLists({
    page,
    query,
    sortBy,
    sortOrder,
    email,
  });

  // first fetch bookmark count
  const { count: bookmarkCount } = await getBookmarkLists({
    email,
    query,
    sortBy,
    sortOrder,
    page: 1, // fetch only to get count
  });

  // clamp bookmark page to max pages
  const totalBookmarkPages = Math.ceil((bookmarkCount ?? 0) / PAGE_SIZE) || 1;
  const bookmarkPage = Math.min(page, totalBookmarkPages);

  // fetch bookmark list with clamped page
  const { data: bookmarkLists } = await getBookmarkLists({
    email,
    query,
    sortBy,
    sortOrder,
    page: bookmarkPage,
  });

  const data = {
    placeLists,
    bookmarkLists,
    sort,
    query,
    page,
    count: placeCount,
  };

  return (
    <div>
      <PlaceLayoutFloating initialData={data} />
    </div>
  );
}
