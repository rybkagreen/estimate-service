import { Module } from '@nestjs/common';
import { AnalyticsModule } from './modules/analytics.module';

@Module({
  imports: [AnalyticsModule],
})
export class AppModule {}
