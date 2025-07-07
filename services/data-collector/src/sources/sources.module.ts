import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { MinstroyParserService } from './minstroyrf-parser.service';
import { FsbtsCollectorService } from './fsbts-collector.service';
import { RegionalDataService } from './regional-data.service';
import { NormativesParserService } from './normatives-parser.service';
import { MarketPricesService } from './market-prices.service';
import { SharedModule } from '../shared/shared.module';

/**
 * Модуль для сбора данных ФСБЦ-2022 из внешних источников
 * Согласно ROADMAP Этап 1.1 - Система сбора данных ФСБЦ-2022
 */
@Module({
  imports: [HttpModule, SharedModule],
  providers: [
    MinstroyParserService,
    FsbtsCollectorService,
    RegionalDataService,
    NormativesParserService,
    MarketPricesService,
  ],
  exports: [
    MinstroyParserService,
    FsbtsCollectorService,
    RegionalDataService,
    NormativesParserService,
    MarketPricesService,
  ],
})
export class SourcesModule {}
