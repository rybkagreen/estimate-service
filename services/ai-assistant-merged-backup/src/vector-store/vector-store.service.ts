import { Injectable } from '@nestjs/common';
import { WeaviateService } from './weaviate.service';

@Injectable()
export class VectorStoreService {
  constructor(private readonly weaviateService: WeaviateService) {}

  async search(query: string, className: string, limit = 10) {
    return this.weaviateService.search(query, className, limit);
  }

  async upsert(className: string, data: any) {
    return this.weaviateService.upsert(className, data);
  }

  async delete(className: string, id: string) {
    return this.weaviateService.delete(className, id);
  }

  async ensureSchema() {
    return this.weaviateService.ensureSchema();
  }
}
