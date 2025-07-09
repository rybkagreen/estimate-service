import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Material, PricePoint } from '../../types/estimate.types';

interface MaterialsListResponse {
  data: Material[];
  total: number;
  page: number;
  pageSize: number;
}

interface MaterialFilter {
  search?: string;
  category?: string;
  supplier?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface CreateMaterialRequest {
  code: string;
  name: string;
  description?: string;
  unit: string;
  basePrice: number;
  category: string;
  supplier?: string;
  specifications?: Record<string, any>;
}

interface UpdateMaterialRequest {
  name?: string;
  description?: string;
  basePrice?: number;
  category?: string;
  supplier?: string;
  specifications?: Record<string, any>;
}

export const materialsApi = createApi({
  reducerPath: 'materialsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/materials',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Material', 'MaterialList'],
  endpoints: (builder) => ({
    // Get all materials
    getMaterials: builder.query<MaterialsListResponse, MaterialFilter | void>({
      query: (filter) => ({
        url: '',
        params: filter,
      }),
      providesTags: ['MaterialList'],
    }),

    // Get single material
    getMaterial: builder.query<Material, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Material', id }],
    }),

    // Create material
    createMaterial: builder.mutation<Material, CreateMaterialRequest>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MaterialList'],
    }),

    // Update material
    updateMaterial: builder.mutation<Material, { id: string; data: UpdateMaterialRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Material', id },
        'MaterialList',
      ],
    }),

    // Delete material
    deleteMaterial: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MaterialList'],
    }),

    // Update material price
    updateMaterialPrice: builder.mutation<Material, { id: string; price: number; source?: string }>({
      query: ({ id, price, source }) => ({
        url: `/${id}/price`,
        method: 'POST',
        body: { price, source },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Material', id }],
    }),

    // Get material price history
    getMaterialPriceHistory: builder.query<PricePoint[], string>({
      query: (id) => `/${id}/price-history`,
    }),

    // Search materials
    searchMaterials: builder.query<Material[], string>({
      query: (searchTerm) => ({
        url: '/search',
        params: { q: searchTerm },
      }),
    }),
  }),
});

export const {
  useGetMaterialsQuery,
  useGetMaterialQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
  useUpdateMaterialPriceMutation,
  useGetMaterialPriceHistoryQuery,
  useSearchMaterialsQuery,
} = materialsApi;
