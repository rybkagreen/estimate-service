import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PredictionController } from './controllers/prediction.controller';
import { PredictionService } from './services/prediction.service';
import { HuggingFaceService } from './services/huggingface.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [PredictionController],
  providers: [PredictionService, HuggingFaceService],
  exports: [PredictionService],
})
export class PredictionModule {}
