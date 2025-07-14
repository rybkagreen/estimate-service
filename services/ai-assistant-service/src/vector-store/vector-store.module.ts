import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VectorStoreService } from './vector-store.service';
import { WeaviateService } from './weaviate.service';

@Module({
  imports: [ConfigModule],
  providers: [VectorStoreService, WeaviateService],
  exports: [VectorStoreService],
})
export class VectorStoreModule {}
