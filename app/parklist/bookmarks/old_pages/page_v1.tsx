import { auth } from '@/app/_lib/auth';
import { getBookmarkLists } from '@/app/_lib/data-service';

import LoginMessage from '@/app/_components/LoginMessage';
import BookmarkLayout from '@/app/_components/BookmarkLayout';

export const revalidate = 0;

export const metadata = {
  title: 'Bookmark',
};

export default async function Page({ searchParams }) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) return <LoginMessage />;

  const sort = searchParams?.sort ?? 'date-desc';
  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const query = searchParams?.query ?? '';

  const { data: bookmarkLists, count } = await getBookmarkLists({
    email,
    page,
    query,
    sort,
  });

  return (
    <BookmarkLayout
      bookmarks={bookmarkLists}
      count={count}
      sort={sort}
      query={query}
      page={page}
    />
  );
}
