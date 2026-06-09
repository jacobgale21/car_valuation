import { create } from 'zustand';

/** Mirrors the Prisma SearchConfig model — frontend-only until the API exists. */
export interface SearchConfiguration {
  platforms: string[];
  makes: string[];
  models: string[];
  yearMin: number;
  yearMax: number;
  minMileage: number;
  maxMileage: number;
  zipCode: string;
  city: string;
  radius: number;
  discountPercent: number;
  discountDollar: number;
}

interface SearchConfigState {
  config: SearchConfiguration;
  lastSavedAt: Date | null;
  setConfig: (partial: Partial<SearchConfiguration>) => void;
  hydrateConfig: (config: SearchConfiguration, savedAt?: Date) => void;
  markSaved: (savedAt: Date) => void;
  togglePlatform: (platform: string) => void;
  addMake: (make: string) => void;
  removeMake: (make: string) => void;
  addModel: (model: string) => void;
  removeModel: (model: string) => void;
}

export const MARKETPLACE_OPTIONS = [
  'Facebook Marketplace',
  'Craigslist',
  'Cars.com',
  'Autotrader',
  'eBay Motors',
  'CarGurus',
] as const;

export const SUGGESTED_MAKES = [
  'Toyota',
  'Honda',
  'Ford',
  'Chevrolet',
  'BMW',
  'Mercedes-Benz',
  'Subaru',
  'Hyundai',
  'Mazda',
  'Tesla',
] as const;

const DEFAULT_CONFIG: SearchConfiguration = {
  platforms: ['Facebook Marketplace', 'Craigslist', 'Cars.com'],
  makes: ['Toyota', 'Honda'],
  models: ['Camry', 'Accord'],
  yearMin: 2016,
  yearMax: 2022,
  minMileage: 0,
  maxMileage: 90000,
  zipCode: '78701',
  city: 'Austin',
  radius: 50,
  discountPercent: 12,
  discountDollar: 2000,
};

export const useSearchConfigStore = create<SearchConfigState>((set) => ({
  config: DEFAULT_CONFIG,
  lastSavedAt: null,

  setConfig: (partial) => {
    set((state) => ({
      config: { ...state.config, ...partial },
    }));
  },

  hydrateConfig: (config, savedAt) => {
    set({
      config,
      lastSavedAt: savedAt ?? null,
    });
  },

  markSaved: (savedAt) => {
    set({ lastSavedAt: savedAt });
  },

  togglePlatform: (platform) => {
    set((state) => {
      const platforms = state.config.platforms.includes(platform)
        ? state.config.platforms.filter((p) => p !== platform)
        : [...state.config.platforms, platform];
      return { config: { ...state.config, platforms } };
    });
  },

  addMake: (make) => {
    const normalized = make.trim();
    if (!normalized) return;
    set((state) => {
      if (state.config.makes.some((m) => m.toLowerCase() === normalized.toLowerCase())) {
        return state;
      }
      return { config: { ...state.config, makes: [...state.config.makes, normalized] } };
    });
  },

  removeMake: (make) => {
    set((state) => ({
      config: {
        ...state.config,
        makes: state.config.makes.filter((m) => m !== make),
      },
    }));
  },

  addModel: (model) => {
    const normalized = model.trim();
    if (!normalized) return;
    set((state) => {
      if (state.config.models.some((m) => m.toLowerCase() === normalized.toLowerCase())) {
        return state;
      }
      return { config: { ...state.config, models: [...state.config.models, normalized] } };
    });
  },

  removeModel: (model) => {
    set((state) => ({
      config: {
        ...state.config,
        models: state.config.models.filter((m) => m !== model),
      },
    }));
  },

}));
