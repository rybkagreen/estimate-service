import { Module } from '@nestjs/common';
import { KnowledgeController } from './controllers/knowledge.controller';
import { KnowledgeService } from './services/knowledge.service';
import { PrismaService } from './services/prisma.service';

@Module({
  imports: [],
  controllers: [KnowledgeController],
  providers: [KnowledgeService, PrismaService],
})
export class AppModule {}

