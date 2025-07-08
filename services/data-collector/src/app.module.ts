import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { CollectorModule } from './collector/collector.module';
import { HealthModule } from './health/health.module';
import { ParserModule } from './parser/parser.module';
import { PrismaModule } from './prisma/prisma.module';

// Общие модули
import { SharedModule } from './shared/shared.module';

// ФСБЦ-2022 модули
import { FerModule } from './modules/fer/fer.module';
import { FsbcModule } from './modules/fsbc/fsbc.module';
import { GesnModule } from './modules/gesn/gesn.module';
import { TerModule } from './modules/ter/ter.module';

// Автоматизация
import { AutomationModule } from './automation/automation.module';

// Анализ
import { HistoricalAnalysisModule } from './modules/historical-analysis/historical-analysis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    HttpModule,
    PrismaModule,

    // Общие модули
    SharedModule,

    // Основные модули сервиса
    CollectorModule,
    ParserModule,
    HealthModule,

    // Модули анализа
    HistoricalAnalysisModule,

    // ФСБЦ-2022 модули
    FerModule,
    TerModule,
    GesnModule,
    FsbcModule,

    // Автоматизация
    AutomationModule,
  ],
})
export class AppModule {}
