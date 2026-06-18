import { create } from 'zustand';

/** Full vehicle listing — mirrors the Prisma Listing model fields used by the UI. */
export interface VehicleListing {
  id: string;
  make: string;
  model: string;
  year: number;
  miles: number;
  platform: string;
  location: string;
  listedPrice: number;
  estimatedPrice: number;
  discountPercentage: number;
  posted: Date;
  url: string;
  description: string;
}

/** Frontend-only metadata tracked when a listing is saved to the shortlist. */
export interface SavedListingEntry {
  savedAt: Date;
  notes: string;
}

interface ListingsState {
  savedListingIds: string[];
  savedEntries: Record<string, SavedListingEntry>;
  toggleSaveListing: (listingId: string) => void;
  removeFromShortlist: (listingId: string) => void;
  updateNotes: (listingId: string, notes: string) => void;
  isSaved: (listingId: string) => boolean;
}

export const useListingsStore = create<ListingsState>((set, get) => ({
  savedListingIds: [],
  savedEntries: {},

  toggleSaveListing: (listingId) => {
    set((state) => {
      const isCurrentlySaved = state.savedListingIds.includes(listingId);

      if (isCurrentlySaved) {
        const { [listingId]: _removed, ...remainingEntries } = state.savedEntries;
        return {
          savedListingIds: state.savedListingIds.filter((id) => id !== listingId),
          savedEntries: remainingEntries,
        };
      }

      return {
        savedListingIds: [...state.savedListingIds, listingId],
        savedEntries: {
          ...state.savedEntries,
          [listingId]: { savedAt: new Date(), notes: '' },
        },
      };
    });
  },

  removeFromShortlist: (listingId) => {
    get().toggleSaveListing(listingId);
  },

  updateNotes: (listingId, notes) => {
    set((state) => ({
      savedEntries: {
        ...state.savedEntries,
        [listingId]: {
          ...state.savedEntries[listingId],
          notes,
        },
      },
    }));
  },

  isSaved: (listingId) => get().savedListingIds.includes(listingId),
}));

export function getPlatformOptions(listings: VehicleListing[]): string[] {
  return [...new Set(listings.map((l) => l.platform))].sort();
}

export function getMakeOptions(listings: VehicleListing[]): string[] {
  return [...new Set(listings.map((l) => l.make))].sort();
}
