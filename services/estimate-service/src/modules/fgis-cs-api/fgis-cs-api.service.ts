import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { CircuitBreakerService } from '../../shared/circuit-breaker/circuit-breaker.service';
import { CacheService } from '../../shared/cache/enhanced-cache.service';
import {
  FGIS_CS_API_BASE_URL,
  FGIS_CS_ENDPOINTS,
  FGIS_CS_LIMITS,
  FgisDataType,
  FgisErrorCode,
} from './constants/fgis-cs.constants';
import { FgisCSParserService } from './fgis-cs-parser.service';

/**
 * Сервис для работы с API ФГИС ЦС (Федеральная государственная информационная система ценообразования в строительстве)
 */
@Injectable()
export class FgisCSApiService {
  private readonly logger = new Logger(FgisCSApiService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly cacheService: CacheService,
    private readonly parserService: FgisCSParserService,
  ) {
    this.apiKey = this.configService.get<string>('FGIS_CS_API_KEY', '');
    this.baseUrl = this.configService.get<string>('FGIS_CS_API_URL', FGIS_CS_API_BASE_URL);
  }

  /**
   * Получить список доступных наборов данных
   */
  async getAvailableDatasets(): Promise<any[]> {
    const cacheKey = 'fgis:datasets:list';
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const response = await this.makeRequest(`${this.baseUrl}/opendata`);
        return this.parserService.parseDatasetList(response);
      },
      { ttl: FGIS_CS_LIMITS.CACHE_TTL_SECONDS }
    );
  }

  /**
   * Получить метаданные конкретного набора данных
   */
  async getDatasetMetadata(datasetId: string): Promise<any> {
    const cacheKey = `fgis:metadata:${datasetId}`;
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const endpoint = `/opendata/${datasetId}/meta.json`;
        const response = await this.makeRequest(`${this.baseUrl}${endpoint}`);
        return response;
      },
      { ttl: FGIS_CS_LIMITS.CACHE_TTL_SECONDS }
    );
  }

  /**
   * Получить данные реестра сметных нормативов
   */
  async getRegistryData(type: FgisDataType, params?: any): Promise<any> {
    const cacheKey = `fgis:registry:${type}:${JSON.stringify(params || {})}`;
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const endpoint = this.getEndpointForType(type);
        const response = await this.makeRequest(`${this.baseUrl}${endpoint}`, params);
        return this.parserService.parseRegistryData(response, type);
      },
      { ttl: FGIS_CS_LIMITS.CACHE_TTL_SECONDS }
    );
  }

  /**
   * Получить классификатор строительных ресурсов (КСР)
   */
  async getConstructionResourcesClassifier(filters?: {
    code?: string;
    name?: string;
    category?: string;
  }): Promise<any[]> {
    const cacheKey = `fgis:ksr:${JSON.stringify(filters || {})}`;
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const endpoint = FGIS_CS_ENDPOINTS.KSR;
        const response = await this.makeRequest(`${this.baseUrl}${endpoint}/data.csv`);
        const parsedData = await this.parserService.parseKSRData(response);
        
        // Применяем фильтры, если они указаны
        if (filters) {
          return this.filterKSRData(parsedData, filters);
        }
        
        return parsedData;
      },
      { ttl: FGIS_CS_LIMITS.CACHE_TTL_SECONDS }
    );
  }

  /**
   * Получить ценовые зоны
   */
  async getPriceZones(regionCode?: string): Promise<any[]> {
    const cacheKey = `fgis:price-zones:${regionCode || 'all'}`;
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const endpoint = FGIS_CS_ENDPOINTS.PRICE_ZONES;
        const response = await this.makeRequest(`${this.baseUrl}${endpoint}/data.csv`);
        const parsedData = await this.parserService.parsePriceZonesData(response);
        
        if (regionCode) {
          return parsedData.filter(zone => zone.regionCode === regionCode);
        }
        
        return parsedData;
      },
      { ttl: FGIS_CS_LIMITS.CACHE_TTL_SECONDS }
    );
  }

  /**
   * Получить данные по оплате труда
   */
  async getLaborCosts(regionCode?: string): Promise<any[]> {
    const cacheKey = `fgis:labor-costs:${regionCode || 'all'}`;
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const endpoint = FGIS_CS_ENDPOINTS.LABOR_COSTS;
        const response = await this.makeRequest(`${this.baseUrl}${endpoint}/data.csv`);
        const parsedData = await this.parserService.parseLaborCostsData(response);
        
        if (regionCode) {
          return parsedData.filter(cost => cost.regionCode === regionCode);
        }
        
        return parsedData;
      },
      { ttl: FGIS_CS_LIMITS.CACHE_TTL_SECONDS }
    );
  }

  /**
   * Получить федеральные сметные нормативы базы (ФСНБ)
   */
  async getFSNBData(year: '2020' | '2022', filters?: {
    code?: string;
    category?: string;
  }): Promise<any[]> {
    const type = year === '2020' ? FgisDataType.FSNB_2020 : FgisDataType.FSNB_2022;
    const cacheKey = `fgis:fsnb:${year}:${JSON.stringify(filters || {})}`;
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const endpoint = year === '2020' ? FGIS_CS_ENDPOINTS.FSNB_2020 : FGIS_CS_ENDPOINTS.FSNB_2022;
        const response = await this.makeRequest(`${this.baseUrl}${endpoint}/data.xml`);
        const parsedData = await this.parserService.parseFSNBData(response, year);
        
        if (filters) {
          return this.filterFSNBData(parsedData, filters);
        }
        
        return parsedData;
      },
      { ttl: FGIS_CS_LIMITS.CACHE_TTL_SECONDS }
    );
  }

  /**
   * Получить технологические группы
   */
  async getTechnologyGroups(): Promise<any[]> {
    const cacheKey = 'fgis:tech-groups:all';
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const endpoint = FGIS_CS_ENDPOINTS.TECH_GROUPS;
        const response = await this.makeRequest(`${this.baseUrl}${endpoint}/data.xml`);
        return this.parserService.parseTechGroupsData(response);
      },
      { ttl: FGIS_CS_LIMITS.CACHE_TTL_SECONDS }
    );
  }

  /**
   * Выполнить HTTP запрос с обработкой ошибок и повторными попытками
   */
  private async makeRequest(url: string, params?: any): Promise<any> {
    const config: AxiosRequestConfig = {
      timeout: FGIS_CS_LIMITS.REQUEST_TIMEOUT_MS,
      params,
      headers: {
        'Accept': 'application/json, application/xml, text/csv',
        'User-Agent': 'EstimateService/1.0',
      },
    };

    // Добавляем API ключ, если он есть
    if (this.apiKey) {
      config.headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return this.circuitBreaker.execute(
      async () => {
        try {
          this.logger.debug(`Making request to: ${url}`);
          const response = await lastValueFrom(
            this.httpService.get(url, config)
          );
          return response.data;
        } catch (error) {
          this.logger.error(`Failed to fetch data from ${url}:`, error.message);
          
          if (error.response?.status === 429) {
            throw new Error(FgisErrorCode.RATE_LIMIT_EXCEEDED);
          }
          
          throw new Error(FgisErrorCode.API_UNAVAILABLE);
        }
      },
      {
        retries: FGIS_CS_LIMITS.MAX_RETRIES,
        retryDelay: FGIS_CS_LIMITS.RETRY_DELAY_MS,
      }
    );
  }

  /**
   * Получить эндпоинт для конкретного типа данных
   */
  private getEndpointForType(type: FgisDataType): string {
    const endpointMap: Partial<Record<FgisDataType, string>> = {
      [FgisDataType.KSR]: FGIS_CS_ENDPOINTS.KSR,
      [FgisDataType.FSNB_2020]: FGIS_CS_ENDPOINTS.FSNB_2020,
      [FgisDataType.FSNB_2022]: FGIS_CS_ENDPOINTS.FSNB_2022,
      [FgisDataType.PRICE_ZONES]: FGIS_CS_ENDPOINTS.PRICE_ZONES,
      [FgisDataType.LABOR_COSTS]: FGIS_CS_ENDPOINTS.LABOR_COSTS,
      [FgisDataType.TECH_GROUPS]: FGIS_CS_ENDPOINTS.TECH_GROUPS,
    };

    const endpoint = endpointMap[type];
    if (!endpoint) {
      throw new Error(`Unknown data type: ${type}`);
    }

    return endpoint;
  }

  /**
   * Фильтрация данных КСР
   */
  private filterKSRData(data: any[], filters: any): any[] {
    return data.filter(item => {
      if (filters.code && !item.code.includes(filters.code)) {
        return false;
      }
      if (filters.name && !item.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      if (filters.category && item.category !== filters.category) {
        return false;
      }
      return true;
    });
  }

  /**
   * Фильтрация данных ФСНБ
   */
  private filterFSNBData(data: any[], filters: any): any[] {
    return data.filter(item => {
      if (filters.code && !item.code.includes(filters.code)) {
        return false;
      }
      if (filters.category && item.category !== filters.category) {
        return false;
      }
      return true;
    });
  }
}
