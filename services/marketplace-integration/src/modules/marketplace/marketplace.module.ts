import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceConnectorFactory } from './connectors/connector.factory';
import { StroyPortalConnector } from './connectors/stroy-portal.connector';
import { B2BSystemConnector } from './connectors/b2b-system.connector';
import { StroyBazaConnector } from './connectors/stroy-baza.connector';
import { PrismaModule } from '../../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    PrismaModule,
    HttpModule,
    BullModule.registerQueue({
      name: 'marketplace-sync',
    }),
  ],
  controllers: [MarketplaceController],
  providers: [
    MarketplaceService,
    MarketplaceConnectorFactory,
    StroyPortalConnector,
    B2BSystemConnector,
    StroyBazaConnector,
  ],
  exports: [MarketplaceService, MarketplaceConnectorFactory],
})
export class MarketplaceModule {}
