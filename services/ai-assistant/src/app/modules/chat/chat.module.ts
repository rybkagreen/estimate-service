import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { DeepSeekModule } from '../../../deepseek/deepseek.module';
import { VectorStoreModule } from '../../../vector-store/vector-store.module';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [DeepSeekModule, VectorStoreModule, PrismaModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
