import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WeaviateService implements OnModuleInit {
  private readonly logger = new Logger(WeaviateService.name);
  private client: WeaviateClient;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeClient();
    await this.ensureSchema();
  }

  private async initializeClient() {
    try {
      const scheme = this.configService.get('WEAVIATE_SCHEME', 'http');
      const host = this.configService.get('WEAVIATE_HOST', 'localhost:8080');
      const apiKey = this.configService.get('WEAVIATE_API_KEY', 'estimate-service-key');

      this.client = weaviate.client({
        scheme,
        host,
        ...(apiKey && {
          apiKey: new ApiKey(apiKey),
        }),
      });

      // Test connection
      const meta = await this.client.meta.getter().do();
      this.logger.log(`Connected to Weaviate v${meta.version}`);
    } catch (error) {
      this.logger.error('Failed to connect to Weaviate', error);
      throw error;
    }
  }
      const schema = await this.client.schema.getter().do();
      const existingClasses = schema.classes?.map((c) => c.class) || [];

      // Класс для хранения расценок ФСБЦ-2022
      if (!existingClasses.includes('FSBCRate')) {
        await this.client.schema
          .classCreator()
          .withClass({
            class: 'FSBCRate',
            description: 'Расценки из базы ФСБЦ-2022',
            vectorizer: 'text2vec-transformers',
            moduleConfig: {
              'text2vec-transformers': {
                poolingStrategy: 'masked_mean',
                vectorizeClassName: false,
              },
            },
            properties: [
              {
                name: 'code',
                dataType: ['string'],
                description: 'Код расценки ФСБЦ',
                tokenization: 'field',
              },
              {
                name: 'name',
                dataType: ['text'],
                description: 'Наименование расценки',
              },
              {
                name: 'unit',
                dataType: ['string'],
                description: 'Единица измерения',
              },
              {
                name: 'category',
                dataType: ['string'],
                description: 'Категория работ',
              },
              {
                name: 'workComposition',
                dataType: ['text'],
                description: 'Состав работ',
              },
              {
                name: 'basePrice',
                dataType: ['number'],
                description: 'Базовая цена',
              },
              {
                name: 'laborCost',
                dataType: ['number'],
                description: 'Затраты труда рабочих',
              },
              {
                name: 'machineCost',
                dataType: ['number'],
                description: 'Эксплуатация машин',
              },
              {
                name: 'materialCost',
                dataType: ['number'],
                description: 'Материальные ресурсы',
              },
              {
                name: 'region',
                dataType: ['string'],
                description: 'Регион применения',
              },
              {
                name: 'year',
                dataType: ['int'],
                description: 'Год актуализации',
              },
              {
                name: 'keywords',
                dataType: ['text[]'],
                description: 'Ключевые слова для поиска',
              },
            ],
          })
          .do();
        this.logger.log('Created FSBCRate class');
      }

      // Класс для хранения исторических смет
      if (!existingClasses.includes('HistoricalEstimate')) {
        await this.client.schema
          .classCreator()
          .withClass({
            class: 'HistoricalEstimate',
            description: 'Исторические сметы для обучения',
            vectorizer: 'text2vec-transformers',
            moduleConfig: {
              'text2vec-transformers': {
                poolingStrategy: 'masked_mean',
                vectorizeClassName: false,
              },
            },
            properties: [
              {
                name: 'projectName',
                dataType: ['string'],
                description: 'Название проекта',
              },
              {
                name: 'projectType',
                dataType: ['string'],
                description: 'Тип проекта',
              },
              {
                name: 'content',
                dataType: ['text'],
                description: 'Содержание сметы',
              },
              {
                name: 'totalCost',
                dataType: ['number'],
                description: 'Общая стоимость',
              },
              {
                name: 'region',
                dataType: ['string'],
                description: 'Регион строительства',
              },
              {
                name: 'year',
                dataType: ['int'],
                description: 'Год составления',
              },
              {
                name: 'workTypes',
                dataType: ['text[]'],
                description: 'Виды работ',
              },
              {
                name: 'usedRates',
                dataType: ['text[]'],
                description: 'Использованные расценки ФСБЦ',
              },
              {
                name: 'accuracy',
                dataType: ['number'],
                description: 'Точность сметы (отклонение от факта)',
              },
            ],
          })
          .do();
        this.logger.log('Created HistoricalEstimate class');
      }

      // Класс для региональных коэффициентов
      if (!existingClasses.includes('RegionalCoefficient')) {
        await this.client.schema
          .classCreator()
          .withClass({
            class: 'RegionalCoefficient',
            description: 'Региональные коэффициенты и индексы',
            vectorizer: 'text2vec-transformers',
            moduleConfig: {
              'text2vec-transformers': {
                poolingStrategy: 'masked_mean',
                vectorizeClassName: false,
              },
            },
            properties: [
              {
                name: 'region',
                dataType: ['string'],
                description: 'Регион',
              },
              {
                name: 'coefficientType',
                dataType: ['string'],
                description: 'Тип коэффициента',
              },
              {
                name: 'value',
                dataType: ['number'],
                description: 'Значение коэффициента',
              },
              {
                name: 'category',
                dataType: ['string'],
                description: 'Категория работ',
              },
              {
                name: 'validFrom',
                dataType: ['date'],
                description: 'Дата начала действия',
              },
              {
                name: 'validTo',
                dataType: ['date'],
                description: 'Дата окончания действия',
              },
              {
                name: 'description',
                dataType: ['text'],
                description: 'Описание применения',
              },
            ],
          })
          .do();
        this.logger.log('Created RegionalCoefficient class');
      }

      this.logger.log('Weaviate schema is ready');
    } catch (error) {
      this.logger.error('Failed to create schema', error);
      throw error;
    }
  }

  getClient(): WeaviateClient {
    return this.client;
  }
}
