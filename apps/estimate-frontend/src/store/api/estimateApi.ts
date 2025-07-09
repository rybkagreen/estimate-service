import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { 
  Estimate, 
  EstimateStatus,
  EstimateFilter,
  EstimateCalculationResult 
} from '../../types/estimate.types';

// Define request/response types
interface CreateEstimateRequest {
  projectId: string;
  name: string;
  description?: string;
  currency?: string;
  vatRate?: number;
  profitMargin?: number;
  tags?: string[];
}

interface UpdateEstimateRequest {
  name?: string;
  description?: string;
  status?: EstimateStatus;
  tags?: string[];
  metadata?: Record<string, any>;
}

interface EstimatesListResponse {
  data: Estimate[];
  total: number;
  page: number;
  pageSize: number;
}

interface EstimateDetailResponse {
  data: Estimate;
}

interface CalculateEstimateRequest {
  estimateId: string;
  parameters?: {
    includeOverhead?: boolean;
    includeProfit?: boolean;
    includeVat?: boolean;
  };
}

// Create the API slice
export const estimateApi = createApi({
  reducerPath: 'estimateApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/estimates',
    prepareHeaders: (headers) => {
      // Add auth token if available
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Estimate', 'EstimateList'],
  endpoints: (builder) => ({
    // Get all estimates
    getEstimates: builder.query<EstimatesListResponse, EstimateFilter | void>({
      query: (filter) => ({
        url: '',
        params: filter,
      }),
      providesTags: ['EstimateList'],
    }),

    // Get single estimate
    getEstimate: builder.query<EstimateDetailResponse, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Estimate', id }],
    }),

    // Create estimate
    createEstimate: builder.mutation<Estimate, CreateEstimateRequest>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['EstimateList'],
    }),

    // Update estimate
    updateEstimate: builder.mutation<Estimate, { id: string; data: UpdateEstimateRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Estimate', id },
        'EstimateList',
      ],
    }),

    // Delete estimate
    deleteEstimate: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EstimateList'],
    }),

    // Update estimate status
    updateEstimateStatus: builder.mutation<Estimate, { id: string; status: EstimateStatus }>({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Estimate', id },
        'EstimateList',
      ],
    }),

    // Calculate estimate
    calculateEstimate: builder.mutation<EstimateCalculationResult, CalculateEstimateRequest>({
      query: ({ estimateId, parameters }) => ({
        url: `/${estimateId}/calculate`,
        method: 'POST',
        body: parameters,
      }),
    }),

    // Duplicate estimate
    duplicateEstimate: builder.mutation<Estimate, string>({
      query: (id) => ({
        url: `/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: ['EstimateList'],
    }),

    // Export estimate
    exportEstimate: builder.mutation<Blob, { id: string; format: 'pdf' | 'excel' | 'json' }>({
      query: ({ id, format }) => ({
        url: `/${id}/export`,
        method: 'POST',
        body: { format },
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Import estimate
    importEstimate: builder.mutation<Estimate, FormData>({
      query: (formData) => ({
        url: '/import',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['EstimateList'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetEstimatesQuery,
  useGetEstimateQuery,
  useCreateEstimateMutation,
  useUpdateEstimateMutation,
  useDeleteEstimateMutation,
  useUpdateEstimateStatusMutation,
  useCalculateEstimateMutation,
  useDuplicateEstimateMutation,
  useExportEstimateMutation,
  useImportEstimateMutation,
} = estimateApi;

// Export endpoints for server-side usage
export const { endpoints } = estimateApi;
