import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AutoCollectorService } from '../services/auto-collector.service';
import { AutomationService } from '../services/automation.service';
import { FileDownloadService } from '../services/file-download.service';
import { FileParserService } from '../services/file-parser.service';
import { HttpClientService } from '../services/http-client.service';
import { ScheduledCollectorService } from '../services/scheduled-collector.service';
import { ValidationService } from '../services/validation.service';

@Global()
@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot()
  ],
  providers: [
    HttpClientService,
    ValidationService,
    FileDownloadService,
    FileParserService,
    AutomationService,
    AutoCollectorService,
    ScheduledCollectorService
  ],
  exports: [
    HttpClientService,
    ValidationService,
    FileDownloadService,
    FileParserService,
    AutomationService,
    AutoCollectorService,
    ScheduledCollectorService
  ],
})
export class SharedModule {}
