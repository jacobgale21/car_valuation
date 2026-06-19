import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  deleteListing,
  fetchSavedListings,
  saveListing,
  type SavedListing,
} from '@/lib/api';
import type { VehicleListing } from '@/stores/listings-store';

export const SAVED_LISTINGS_QUERY_KEY = ['saved-listings'] as const;

const SAVED_LISTINGS_STALE_TIME = 5 * 60 * 1000;

export function useSavedListings() {
  return useQuery({
    queryKey: SAVED_LISTINGS_QUERY_KEY,
    queryFn: fetchSavedListings,
    staleTime: SAVED_LISTINGS_STALE_TIME,
  });
}

export function useSavedListingIds() {
  const { data: savedListings = [] } = useSavedListings();

  return useMemo(
    () => new Set(savedListings.map((saved) => saved.listingId)),
    [savedListings],
  );
}

export function useSaveListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listing: VehicleListing) => saveListing(listing),
    onSuccess: (saved) => {
      queryClient.setQueryData<SavedListing[]>(SAVED_LISTINGS_QUERY_KEY, (current = []) => {
        if (current.some((item) => item.listingId === saved.listingId)) {
          return current;
        }
        return [saved, ...current];
      });
    },
  });
}

export function useDeleteSavedListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => deleteListing(listingId),
    onSuccess: (_result, listingId) => {
      queryClient.setQueryData<SavedListing[]>(SAVED_LISTINGS_QUERY_KEY, (current = []) =>
        current.filter((item) => item.listingId !== listingId),
      );
    },
  });
}

export function useUpdateSavedListingNotes() {
  const queryClient = useQueryClient();

  return (listingId: string, notes: string) => {
    queryClient.setQueryData<SavedListing[]>(SAVED_LISTINGS_QUERY_KEY, (current = []) =>
      current.map((item) => (item.listingId === listingId ? { ...item, notes } : item)),
    );
  };
}
