import { useQuery } from '@tanstack/react-query';

import { fetchListings } from '@/lib/api';

export const LISTINGS_QUERY_KEY = ['listings'] as const;

export function useListings() {
  return useQuery({
    queryKey: LISTINGS_QUERY_KEY,
    queryFn: fetchListings,
  });
}
