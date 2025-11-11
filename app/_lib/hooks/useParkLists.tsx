'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { PAGE_SIZE } from '@/app/_lib/utils/constants';
import { getParkLists } from '../data-service';
import type { Park } from '@/types/park';

interface ParkListResponse {
  data: Park[];
  count: number | null;
}

export function useParkLists() {
  const queryClient = useQueryClient(); // ✅ useQueryClient() instead of new QueryClient()
  const searchParams = useSearchParams();

  // ✅ Parse current page from URL
  const page = Number(searchParams.get('page')) || 1;

  // ✅ Main fetch
  const { isLoading, data, error } = useQuery<ParkListResponse>({
    queryKey: ['parkLists', page],
    queryFn: () => getParkLists({ page }),
    keepPreviousData: true,
  });

  const parkLists = data?.data ?? [];
  const count = data?.count ?? 0;

  // ✅ Prefetch next and previous pages
  const pageCount = Math.ceil(count / PAGE_SIZE);

  if (page < pageCount) {
    queryClient.prefetchQuery({
      queryKey: ['parkLists', page + 1],
      queryFn: () => getParkLists({ page: page + 1 }),
    });
  }

  if (page > 1) {
    queryClient.prefetchQuery({
      queryKey: ['parkLists', page - 1],
      queryFn: () => getParkLists({ page: page - 1 }),
    });
  }

  return { isLoading, error, parkLists, count };
}
