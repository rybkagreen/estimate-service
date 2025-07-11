import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  updatedAt: string;
}

export const knowledgeApi = createApi({
  reducerPath: 'knowledgeApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/ai-assistant/knowledge' }),
  endpoints: builder => ({
    search: builder.query<
      KnowledgeArticle[],
      { query?: string; category?: string; page?: number; pageSize?: number }
    >({
      query: params => {
        const q = new URLSearchParams();
        if (params?.query) q.append('query', params.query);
        if (params?.category) q.append('category', params.category);
        if (params?.page) q.append('page', params.page.toString());
        if (params?.pageSize) q.append('pageSize', params.pageSize.toString());
        return `search?${q.toString()}`;
      },
    }),
    getById: builder.query<KnowledgeArticle, string>({
      query: id => `${id}`,
    }),
  }),
});

export const { useSearchQuery, useGetByIdQuery } = knowledgeApi;
