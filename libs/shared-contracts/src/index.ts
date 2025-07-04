// Re-export from auth types
export * from './auth.types';

// Re-export from project types
export * from './project.types';

// Re-export from AI types
export * from './ai.types';

// Re-export from notification types
export * from './notification.types';

// Re-export from document types
export * from './document.types';

// Re-export from grand smeta types
export * from './grand-smeta.types';

// Vector DB and search types
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
