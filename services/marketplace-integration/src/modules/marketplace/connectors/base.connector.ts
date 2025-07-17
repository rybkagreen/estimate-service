import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cache } from 'cache-manager';
import { 
  MarketplaceConnector, 
  HealthCheckResult, 
  ProductSearchQuery, 
  ProductSearchResult,
  ProductDetails,
  PriceInfo,
  AvailabilityInfo,
  PricePeriod,
  PriceHistory,
  DeliveryCalculationParams,
  DeliveryInfo,
  OrderCreateRequest,
  OrderCreateResponse,
  OrderStatus
} from '../interfaces/marketplace-connector.interface';

export abstract class BaseConnector implements MarketplaceConnector {
  protected readonly logger: Logger;
  
  constructor(
    protected readonly httpService: HttpService,
    protected readonly cache: Cache,
    protected readonly config: MarketplaceConfig,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  abstract readonly marketplaceId: string;
  abstract readonly name: string;

  /**
   * Базовая реализация health check
   */
  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.config.healthCheckUrl || this.config.baseUrl, {
          timeout: 5000,
        })
      );
      
      const latency = Date.now() - startTime;
      
      return {
        status: response.status === 200 ? 'healthy' : 'degraded',
        latency,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  abstract searchProducts(query: ProductSearchQuery): Promise<ProductSearchResult>;
  abstract getProductDetails(productId: string): Promise<ProductDetails | null>;
  abstract getCurrentPrice(productId: string): Promise<PriceInfo | null>;
  abstract checkAvailability(productId: string, quantity: number): Promise<AvailabilityInfo>;
  abstract getPriceHistory(productId: string, period: PricePeriod): Promise<PriceHistory[]>;
  abstract calculateDelivery(params: DeliveryCalculationParams): Promise<DeliveryInfo>;
  abstract createOrder(order: OrderCreateRequest): Promise<OrderCreateResponse>;
  abstract getOrderStatus(orderId: string): Promise<OrderStatus>;

  /**
   * Хелпер для выполнения HTTP запросов с retry логикой
   */
  protected async makeRequest<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: any,
    retries = 3
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < retries; i++) {
      try {
        const response = await firstValueFrom(
          this.httpService.request({
            method,
            url: `${this.config.baseUrl}${url}`,
            data,
            headers: this.getHeaders(),
            timeout: this.config.timeout || 30000,
          })
        );
        
        return response.data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        this.logger.warn(`Request failed (attempt ${i + 1}/${retries}): ${lastError.message}`);
        
        if (i < retries - 1) {
          await this.delay(Math.pow(2, i) * 1000); // Exponential backoff
        }
      }
    }
    
    throw lastError || new Error('Request failed after all retries');
  }

  /**
   * Получение заголовков для запросов
   */
  protected getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'EstimateService/1.0',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    if (this.config.additionalHeaders) {
      Object.assign(headers, this.config.additionalHeaders);
    }

    return headers;
  }

  /**
   * Кеширование результатов
   */
  protected async getCached<T>(key: string): Promise<T | null> {
    try {
      return await this.cache.get<T>(key);
    } catch (error) {
      this.logger.warn(`Cache get error: ${error}`);
      return null;
    }
  }

  /**
   * Сохранение в кеш
   */
  protected async setCached<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cache.set(key, value, ttl || this.config.cacheTTL || 3600);
    } catch (error) {
      this.logger.warn(`Cache set error: ${error}`);
    }
  }

  /**
   * Хелпер для задержки
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export interface MarketplaceConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  cacheTTL?: number;
  healthCheckUrl?: string;
  additionalHeaders?: Record<string, string>;
}
