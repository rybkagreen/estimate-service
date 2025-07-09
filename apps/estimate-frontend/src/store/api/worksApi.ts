import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Work, MaterialRequirement, EquipmentRequirement } from '../../types/estimate.types';

interface WorksListResponse {
  data: Work[];
  total: number;
  page: number;
  pageSize: number;
}

interface WorkFilter {
  search?: string;
  category?: string;
  complexity?: 'LOW' | 'MEDIUM' | 'HIGH';
  minLaborRate?: number;
  maxLaborRate?: number;
}

interface CreateWorkRequest {
  code: string;
  name: string;
  description?: string;
  unit: string;
  laborHours: number;
  laborRate: number;
  category: string;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  requiredSkills: string[];
  materials?: MaterialRequirement[];
  equipment?: EquipmentRequirement[];
}

interface UpdateWorkRequest {
  name?: string;
  description?: string;
  laborHours?: number;
  laborRate?: number;
  category?: string;
  complexity?: 'LOW' | 'MEDIUM' | 'HIGH';
  requiredSkills?: string[];
  materials?: MaterialRequirement[];
  equipment?: EquipmentRequirement[];
}

export const worksApi = createApi({
  reducerPath: 'worksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/works',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Work', 'WorkList'],
  endpoints: (builder) => ({
    // Get all works
    getWorks: builder.query<WorksListResponse, WorkFilter | void>({
      query: (filter) => ({
        url: '',
        params: filter,
      }),
      providesTags: ['WorkList'],
    }),

    // Get single work
    getWork: builder.query<Work, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Work', id }],
    }),

    // Create work
    createWork: builder.mutation<Work, CreateWorkRequest>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WorkList'],
    }),

    // Update work
    updateWork: builder.mutation<Work, { id: string; data: UpdateWorkRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Work', id },
        'WorkList',
      ],
    }),

    // Delete work
    deleteWork: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WorkList'],
    }),

    // Get works by category
    getWorksByCategory: builder.query<Work[], string>({
      query: (category) => ({
        url: '/by-category',
        params: { category },
      }),
    }),

    // Search works
    searchWorks: builder.query<Work[], string>({
      query: (searchTerm) => ({
        url: '/search',
        params: { q: searchTerm },
      }),
    }),

    // Calculate work cost
    calculateWorkCost: builder.mutation<{ totalCost: number; breakdown: any }, { workId: string; quantity: number }>({
      query: ({ workId, quantity }) => ({
        url: `/${workId}/calculate`,
        method: 'POST',
        body: { quantity },
      }),
    }),
  }),
});

export const {
  useGetWorksQuery,
  useGetWorkQuery,
  useCreateWorkMutation,
  useUpdateWorkMutation,
  useDeleteWorkMutation,
  useGetWorksByCategoryQuery,
  useSearchWorksQuery,
  useCalculateWorkCostMutation,
} = worksApi;
