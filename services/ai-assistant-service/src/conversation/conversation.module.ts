import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { DeepSeekModule } from '../deepseek/deepseek.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [DeepSeekModule, PrismaModule],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
