import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  aiModel: string;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['UserProfile'],
  endpoints: builder => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => '/auth/profile', // Исправлен путь на существующий endpoint
      providesTags: ['UserProfile'],
    }),
    updateProfile: builder.mutation<UserProfile, Partial<UserProfile>>({
      query: body => ({
        url: '/user/profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['UserProfile'],
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = userApi;
