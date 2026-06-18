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
  recordScan: (dealsFound: number) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  savedDealsCount: 0,
  dealsFoundToday: 0,
  recentScans: [],

  recordScan: (dealsFound) => {
    set((state) => ({
      dealsFoundToday: state.dealsFoundToday + dealsFound,
      recentScans: [
        {
          id: `scan-${Date.now()}`,
          completedAt: new Date(),
          dealsFound,
        },
        ...state.recentScans,
      ].slice(0, 5),
    }));
  },
}));
