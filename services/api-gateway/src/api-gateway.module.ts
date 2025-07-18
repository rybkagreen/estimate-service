import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'ESTIMATE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.ESTIMATE_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.ESTIMATE_SERVICE_PORT || '3022'),
        },
      },
      {
        name: 'AI_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AI_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.AI_SERVICE_PORT || '3023'),
        },
      },
      {
        name: 'DATA_COLLECTOR_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.DATA_COLLECTOR_HOST || 'localhost',
          port: parseInt(process.env.DATA_COLLECTOR_PORT || '3024'),
        },
      },
    ]),
  ],
  controllers: [ProxyController],
  providers: [ProxyService],
})
export class ApiGatewayModule {}
