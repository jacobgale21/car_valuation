import axios from 'axios';

import type { VehicleListing } from '@/stores/listings-store';

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export interface HealthResponse {
  status: string;
}

export async function healthCheck(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>('/api/health');
  return data;
}

export interface SearchConfigurationPayload {
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

export interface SaveSearchConfigurationResponse {
  data: SearchConfigurationPayload & { id: string };
  savedAt: string;
}

export async function saveSearchConfiguration(
  config: SearchConfigurationPayload,
): Promise<SaveSearchConfigurationResponse> {
  const { data } = await apiClient.post<SaveSearchConfigurationResponse>(
    '/api/search-configuration',
    config,
  );
  return data;
}

export async function fetchSearchConfiguration(): Promise<
  SearchConfigurationPayload & { id: string }
> {
  const { data } = await apiClient.get<{ data: SearchConfigurationPayload & { id: string } }>(
    '/api/search-configuration',
  );
  return data.data;
}

export interface RunSearchResponse {
  ranAt: string;
  searchConfigId: string;
  config: {
    city: string;
    makes: string[];
    models: string[];
    platforms: string[];
  };
}

interface ListingDto {
  id: string;
  listedPrice: number;
  make: string;
  model: string;
  year: number;
  miles: number;
  platform: string;
  posted: string;
  url: string;
  estimatedPrice: number | null;
  discountPercentage: number | null;
  location: string;
  zip_code: string;
}

function toVehicleListing(dto: ListingDto): VehicleListing {
  return {
    id: dto.id,
    make: dto.make,
    model: dto.model,
    year: dto.year,
    miles: dto.miles,
    platform: dto.platform,
    location: dto.location,
    listedPrice: dto.listedPrice,
    estimatedPrice: dto.estimatedPrice ?? 0,
    discountPercentage: dto.discountPercentage ?? 0,
    posted: new Date(dto.posted),
    url: dto.url,
    description: '',
  };
}

/** Runs Apify + valuation and saves listings to the database. */
export async function runSearch(): Promise<RunSearchResponse> {
  const { data } = await apiClient.post<RunSearchResponse>(
    '/api/searches/run',
    {},
    { timeout: 300_000 },
  );
  return data;
}

/** Fetches persisted listings from the database. */
export async function fetchListings(): Promise<VehicleListing[]> {
  const { data } = await apiClient.get<{ data: ListingDto[] }>('/api/listings');
  return data.data.map(toVehicleListing);
}

/** Runs a search, then loads saved listings from the database. */
export async function runSearchAndFetchListings(): Promise<VehicleListing[]> {
  await runSearch();
  return fetchListings();
}

export default apiClient;
