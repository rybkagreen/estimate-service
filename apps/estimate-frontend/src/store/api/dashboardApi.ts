import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface DashboardStats {
  activeProjects: number;
  estimatesInProgress: number;
  completedEstimates: number;
  savings: number;
  criticalTasks: { id: string; title: string; status: string }[];
}

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: builder => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/dashboard/stats',
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
