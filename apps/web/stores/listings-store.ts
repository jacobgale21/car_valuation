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
  listings: VehicleListing[];
  savedListingIds: string[];
  savedEntries: Record<string, SavedListingEntry>;
  toggleSaveListing: (listingId: string) => void;
  removeFromShortlist: (listingId: string) => void;
  updateNotes: (listingId: string, notes: string) => void;
  isSaved: (listingId: string) => boolean;
}

const MOCK_LISTINGS: VehicleListing[] = [
  {
    id: 'listing-1',
    make: 'Toyota',
    model: 'Camry',
    year: 2019,
    miles: 62400,
    platform: 'Facebook Marketplace',
    location: 'Austin, TX',
    listedPrice: 16400,
    estimatedPrice: 20100,
    discountPercentage: 18.4,
    posted: new Date(Date.now() - 3 * 60 * 60 * 1000),
    url: 'https://example.com/listing/1',
    description:
      'Clean title, one owner. Regular oil changes, new tires last year. Minor scratch on rear bumper.',
  },
  {
    id: 'listing-2',
    make: 'Honda',
    model: 'Accord',
    year: 2018,
    miles: 71200,
    platform: 'Craigslist',
    location: 'Round Rock, TX',
    listedPrice: 15200,
    estimatedPrice: 18150,
    discountPercentage: 16.3,
    posted: new Date(Date.now() - 8 * 60 * 60 * 1000),
    url: 'https://example.com/listing/2',
    description:
      'LX trim, silver exterior. Seller motivated — relocating next month. AC blows cold, no warning lights.',
  },
  {
    id: 'listing-3',
    make: 'Mazda',
    model: 'CX-5',
    year: 2020,
    miles: 45800,
    platform: 'Cars.com',
    location: 'Cedar Park, TX',
    listedPrice: 21900,
    estimatedPrice: 25700,
    discountPercentage: 14.8,
    posted: new Date(Date.now() - 1 * 60 * 60 * 1000),
    url: 'https://example.com/listing/3',
    description:
      'Grand Touring AWD. Leather seats, Bose audio, adaptive cruise. Dealer-maintained service records available.',
  },
  {
    id: 'listing-4',
    make: 'Subaru',
    model: 'Outback',
    year: 2017,
    miles: 89300,
    platform: 'Autotrader',
    location: 'Georgetown, TX',
    listedPrice: 13800,
    estimatedPrice: 17550,
    discountPercentage: 21.4,
    posted: new Date(Date.now() - 14 * 60 * 60 * 1000),
    url: 'https://example.com/listing/4',
    description:
      '2.5i Premium with eyesight. Roof rack included. Small rock chip on windshield, otherwise excellent condition.',
  },
  {
    id: 'listing-5',
    make: 'Ford',
    model: 'Fusion',
    year: 2019,
    miles: 55000,
    platform: 'Facebook Marketplace',
    location: 'Pflugerville, TX',
    listedPrice: 14200,
    estimatedPrice: 17200,
    discountPercentage: 17.4,
    posted: new Date(Date.now() - 5 * 60 * 60 * 1000),
    url: 'https://example.com/listing/5',
    description:
      'SE Hybrid. Great fuel economy, backup camera, Bluetooth. Non-smoker, garage kept.',
  },
  {
    id: 'listing-6',
    make: 'Hyundai',
    model: 'Sonata',
    year: 2020,
    miles: 41000,
    platform: 'Craigslist',
    location: 'Austin, TX',
    listedPrice: 17500,
    estimatedPrice: 20600,
    discountPercentage: 15.0,
    posted: new Date(Date.now() - 22 * 60 * 60 * 1000),
    url: 'https://example.com/listing/6',
    description:
      'SEL Plus trim with panoramic sunroof. Apple CarPlay, heated seats. Single accident on Carfax — rear bumper only.',
  },
  {
    id: 'listing-7',
    make: 'Toyota',
    model: 'RAV4',
    year: 2021,
    miles: 38200,
    platform: 'Cars.com',
    location: 'Kyle, TX',
    listedPrice: 24800,
    estimatedPrice: 27900,
    discountPercentage: 11.1,
    posted: new Date(Date.now() - 6 * 60 * 60 * 1000),
    url: 'https://example.com/listing/7',
    description:
      'XLE AWD. Lane assist, blind-spot monitoring. All scheduled maintenance done at Toyota dealership.',
  },
  {
    id: 'listing-8',
    make: 'Honda',
    model: 'CR-V',
    year: 2019,
    miles: 59100,
    platform: 'Autotrader',
    location: 'San Marcos, TX',
    listedPrice: 19600,
    estimatedPrice: 23400,
    discountPercentage: 16.2,
    posted: new Date(Date.now() - 11 * 60 * 60 * 1000),
    url: 'https://example.com/listing/8',
    description:
      'EX trim with Honda Sensing. New brakes and battery. Third row not included — standard 5-seat configuration.',
  },
];

/** Demo shortlist entries so the page is not empty before visiting Listings. */
const INITIAL_SAVED_ENTRIES: Record<string, SavedListingEntry> = {
  'listing-1': { savedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), notes: '' },
  'listing-3': {
    savedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    notes: 'Schedule test drive this weekend.',
  },
};

export const useListingsStore = create<ListingsState>((set, get) => ({
  listings: MOCK_LISTINGS,
  savedListingIds: ['listing-1', 'listing-3'],
  savedEntries: INITIAL_SAVED_ENTRIES,

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
