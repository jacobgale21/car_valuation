import { create } from 'zustand';

/** A single completed vehicle search run shown in the Recent Scans sidebar. */
export interface RecentScan {
  id: string;
  completedAt: Date;
  dealsFound: number;
}

/** A vehicle listing surfaced as a top deal on the dashboard. */
export interface BestDeal {
  id: string;
  make: string;
  model: string;
  year: number;
  miles: number;
  platform: string;
  location: string;
  listedPrice: number;
  discountPercentage: number;
  url: string;
}

interface DashboardState {
  savedDealsCount: number;
  dealsFoundToday: number;
  recentScans: RecentScan[];
  bestDeals: BestDeal[];
  isSearching: boolean;
  runSearch: () => Promise<void>;
}

const INITIAL_RECENT_SCANS: RecentScan[] = [
  { id: 'scan-1', completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), dealsFound: 14 },
  { id: 'scan-2', completedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), dealsFound: 8 },
  { id: 'scan-3', completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), dealsFound: 21 },
];

const INITIAL_BEST_DEALS: BestDeal[] = [
  {
    id: 'deal-1',
    make: 'Toyota',
    model: 'Camry',
    year: 2019,
    miles: 62400,
    platform: 'Facebook Marketplace',
    location: 'Austin, TX',
    listedPrice: 16400,
    discountPercentage: 18.5,
    url: 'https://example.com/listing/1',
  },
  {
    id: 'deal-2',
    make: 'Honda',
    model: 'Accord',
    year: 2018,
    miles: 71200,
    platform: 'Craigslist',
    location: 'Round Rock, TX',
    listedPrice: 15200,
    discountPercentage: 16.2,
    url: 'https://example.com/listing/2',
  },
  {
    id: 'deal-3',
    make: 'Mazda',
    model: 'CX-5',
    year: 2020,
    miles: 45800,
    platform: 'Cars.com',
    location: 'Cedar Park, TX',
    listedPrice: 21900,
    discountPercentage: 14.8,
    url: 'https://example.com/listing/3',
  },
  {
    id: 'deal-4',
    make: 'Subaru',
    model: 'Outback',
    year: 2017,
    miles: 89300,
    platform: 'Autotrader',
    location: 'Georgetown, TX',
    listedPrice: 13800,
    discountPercentage: 21.3,
    url: 'https://example.com/listing/4',
  },
];

/** Mock pool of deals appended after each search until the API exists. */
const MOCK_DEAL_POOL: Omit<BestDeal, 'id'>[] = [
  {
    make: 'Ford',
    model: 'Fusion',
    year: 2019,
    miles: 55000,
    platform: 'Facebook Marketplace',
    location: 'Pflugerville, TX',
    listedPrice: 14200,
    discountPercentage: 17.4,
    url: 'https://example.com/listing/5',
  },
  {
    make: 'Hyundai',
    model: 'Sonata',
    year: 2020,
    miles: 41000,
    platform: 'Craigslist',
    location: 'Austin, TX',
    listedPrice: 17500,
    discountPercentage: 15.1,
    url: 'https://example.com/listing/6',
  },
  {
    make: 'Nissan',
    model: 'Altima',
    year: 2018,
    miles: 68000,
    platform: 'Cars.com',
    location: 'Kyle, TX',
    listedPrice: 12900,
    discountPercentage: 19.6,
    url: 'https://example.com/listing/7',
  },
];

function pickRandomDeals(count: number): BestDeal[] {
  const shuffled = [...MOCK_DEAL_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((deal, index) => ({
    ...deal,
    id: `deal-${Date.now()}-${index}`,
  }));
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  savedDealsCount: 12,
  dealsFoundToday: 14,
  recentScans: INITIAL_RECENT_SCANS,
  bestDeals: INITIAL_BEST_DEALS,
  isSearching: false,

  runSearch: async () => {
    if (get().isSearching) return;

    set({ isSearching: true });

    await new Promise((resolve) => setTimeout(resolve, 1800));

    const dealsFound = Math.floor(Math.random() * 18) + 3;
    const newDeals = pickRandomDeals(Math.min(2, dealsFound));

    set((state) => ({
      isSearching: false,
      dealsFoundToday: state.dealsFoundToday + dealsFound,
      recentScans: [
        {
          id: `scan-${Date.now()}`,
          completedAt: new Date(),
          dealsFound,
        },
        ...state.recentScans,
      ].slice(0, 5),
      bestDeals: [...newDeals, ...state.bestDeals]
        .sort((a, b) => b.discountPercentage - a.discountPercentage)
        .slice(0, 8),
    }));
  },
}));
