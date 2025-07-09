import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  Estimate,
  CreateEstimateDto,
  UpdateEstimateDto,
  EstimateApiError
} from './types/estimate.types';

export class EstimateApiClient {
  private readonly api: AxiosInstance;

  constructor(baseURL: string, authToken?: string) {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Configure auth token interceptor
    this.api.interceptors.request.use(
      (config) => {
        if (authToken) {
          config.headers.Authorization = `Bearer ${authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Configure error handling interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message;
        throw new EstimateApiError(status, message, error);
      }
    );
  }

  /**
   * Fetch all estimates
   */
  async getEstimates(): Promise<Estimate[]> {
    const response = await this.api.get<Estimate[]>('/estimates');
    return response.data;
  }

  /**
   * Fetch a single estimate by ID
   */
  async getEstimate(id: string): Promise<Estimate> {
    const response = await this.api.get<Estimate>(`/estimates/${id}`);
    return response.data;
  }

  /**
   * Create a new estimate
   */
  async createEstimate(data: CreateEstimateDto): Promise<Estimate> {
    const response = await this.api.post<Estimate>('/estimates', data);
    return response.data;
  }

  /**
   * Update an existing estimate
   */
  async updateEstimate(id: string, data: UpdateEstimateDto): Promise<Estimate> {
    const response = await this.api.patch<Estimate>(`/estimates/${id}`, data);
    return response.data;
  }

  /**
   * Delete an estimate
   */
  async deleteEstimate(id: string): Promise<void> {
    await this.api.delete(`/estimates/${id}`);
  }
}

export function apiClient(): string {
  return 'api-client';
}
