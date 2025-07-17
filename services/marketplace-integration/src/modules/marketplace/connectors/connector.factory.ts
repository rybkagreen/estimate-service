import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MarketplaceConnector } from '../interfaces/marketplace-connector.interface';
import { StroyPortalConnector } from './stroy-portal.connector';
import { B2BSystemConnector } from './b2b-system.connector';
import { StroyBazaConnector } from './stroy-baza.connector';

@Injectable()
export class MarketplaceConnectorFactory {
  private readonly connectors: Map<string, MarketplaceConnector> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {
    this.initializeConnectors();
  }

  /**
   * Инициализация всех доступных коннекторов
   */
  private initializeConnectors(): void {
    // StroyPortal
    if (this.configService.get('STROYPORTAL_ENABLED') === 'true') {
      const stroyPortalConnector = new StroyPortalConnector(
        this.httpService,
        this.cache,
        {
          baseUrl: this.configService.get('STROYPORTAL_API_URL', 'https://api.stroyportal.ru'),
          apiKey: this.configService.get('STROYPORTAL_API_KEY'),
          timeout: 30000,
          cacheTTL: 3600,
        }
      );
      this.connectors.set(stroyPortalConnector.marketplaceId, stroyPortalConnector);
    }

    // B2B-System
    if (this.configService.get('B2B_SYSTEM_ENABLED') === 'true') {
      const b2bSystemConnector = new B2BSystemConnector(
        this.httpService,
        this.cache,
        {
          baseUrl: this.configService.get('B2B_SYSTEM_API_URL', 'https://api.b2b-system.ru'),
          apiKey: this.configService.get('B2B_SYSTEM_API_KEY'),
          timeout: 30000,
          cacheTTL: 3600,
        }
      );
      this.connectors.set(b2bSystemConnector.marketplaceId, b2bSystemConnector);
    }

    // StroyBaza
    if (this.configService.get('STROYBAZA_ENABLED') === 'true') {
      const stroyBazaConnector = new StroyBazaConnector(
        this.httpService,
        this.cache,
        {
          baseUrl: this.configService.get('STROYBAZA_API_URL', 'https://api.stroybaza.ru'),
          apiKey: this.configService.get('STROYBAZA_API_KEY'),
          timeout: 30000,
          cacheTTL: 3600,
        }
      );
      this.connectors.set(stroyBazaConnector.marketplaceId, stroyBazaConnector);
    }
  }

  /**
   * Получить коннектор по ID маркетплейса
   */
  getConnector(marketplaceId: string): MarketplaceConnector | undefined {
    return this.connectors.get(marketplaceId);
  }

  /**
   * Получить все доступные коннекторы
   */
  getAllConnectors(): MarketplaceConnector[] {
    return Array.from(this.connectors.values());
  }

  /**
   * Получить список доступных маркетплейсов
   */
  getAvailableMarketplaces(): { id: string; name: string }[] {
    return Array.from(this.connectors.values()).map(connector => ({
      id: connector.marketplaceId,
      name: connector.name,
    }));
  }

  /**
   * Проверить здоровье всех коннекторов
   */
  async checkAllConnectors(): Promise<Map<string, { name: string; status: string; latency: number }>> {
    const results = new Map<string, { name: string; status: string; latency: number }>();

    for (const [id, connector] of this.connectors) {
      const healthCheck = await connector.healthCheck();
      results.set(id, {
        name: connector.name,
        status: healthCheck.status,
        latency: healthCheck.latency,
      });
    }

    return results;
  }
}
