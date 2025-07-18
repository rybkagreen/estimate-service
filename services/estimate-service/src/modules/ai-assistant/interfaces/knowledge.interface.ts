export interface KnowledgeContext {
  taskType: string;
  context: Record<string, any>;
}

export interface KnowledgeData {
  [key: string]: any;
}
