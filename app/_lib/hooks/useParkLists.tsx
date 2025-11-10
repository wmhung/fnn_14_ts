'use client';

import { useQuery, QueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { PAGE_SIZE } from '../../utils/constants';
import { getParkListsCount } from '../data-service';

export function useParkLists() {
  const queryClient = new QueryClient();
  const searchParams = useSearchParams();

  //pagination
  const page = !searchParams.get('page') ? 1 : Number(searchParams.get('page'));

  // query
  const { isLoading, data, error } = useQuery<ParkListResponse>({
    queryKey: ['parkLists', page],
    queryFn: () => getParkListsCount({ page }),
  });

  const parkLists = data?.data ?? [];
  const count = data?.count ?? 0;

  // pre-fetching
  const pageCount = Math.ceil(count / PAGE_SIZE);

  if (page < pageCount)
    queryClient.prefetchQuery({
      queryKey: ['parkLists', page + 1], // filter is to reload web page automatically
      queryFn: () => getParkListsCount({ page: page + 1 }),
    });

  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ['parkLists', page - 1], // filter is to reload web page automatically
      queryFn: () => getParkListsCount({ page: page - 1 }),
    });

  return { isLoading, error, parkLists, count };
}
