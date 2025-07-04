export * from './auth.types';
export * from './project.types';
export * from './ai.types';
export * from './notification.types';
export * from './document.types';
export * from './grand-smeta.types';
export interface VectorSearchRequest {
    query: string;
    vector?: number[];
    filters?: Record<string, any>;
    topK?: number;
    threshold?: number;
}
export interface VectorSearchResult {
    id: string;
    score: number;
    metadata: Record<string, any>;
    content?: string;
}
export interface VectorIndexRequest {
    id: string;
    vector: number[];
    metadata: Record<string, any>;
    content?: string;
}
export interface VectorSearchResponse {
    results: VectorSearchResult[];
    totalResults: number;
    searchTime: number;
}
//# sourceMappingURL=index.d.ts.map