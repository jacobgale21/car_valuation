import axios from 'axios';

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

export default apiClient;
