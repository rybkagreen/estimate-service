import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { HttpClientService } from '../services/http-client.service';
import { ValidationService } from '../services/validation.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [HttpClientService, ValidationService],
  exports: [HttpClientService, ValidationService],
})
export class SharedModule {}
