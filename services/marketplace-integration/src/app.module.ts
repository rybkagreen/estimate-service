import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { TransportModule } from './modules/transport/transport.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 3600, // 1 hour default
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    PrismaModule,
    MarketplaceModule,
    PricingModule,
    TransportModule,
    AvailabilityModule,
  ],
})
export class AppModule {}
