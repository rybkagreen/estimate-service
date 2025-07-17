import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TsnService {
  private readonly logger = new Logger(TsnService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService
  ) {}

  async syncTsnData(): Promise<void> {
    this.logger.log('Starting TSN data synchronization');

    try {
      // Logic to fetch and update TSN data
      // For now, let's assume it's a simple sync
      const tsnItems: any[] = [];

      // Fetch new data and update database
      await this.prisma.tsnItem.createMany({ data: tsnItems });

      this.logger.log(`Synchronized ${tsnItems.length} TSN items`);
    } catch (error) {
      this.logger.error('Failed to synchronize TSN data', error);
    }
  }
}
