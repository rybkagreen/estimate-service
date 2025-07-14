#!/usr/bin/env ts-node

import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.join(__dirname, '../.env') });

const WEAVIATE_HOST = process.env.WEAVIATE_HOST || 'localhost:8080';
const WEAVIATE_API_KEY = process.env.WEAVIATE_API_KEY || 'estimate-service-key';

async function initializeWeaviateData() {
  console.log('🚀 Initializing Weaviate with sample data...');

  try {
    // Initialize Weaviate client
    const client: WeaviateClient = weaviate.client({
      scheme: 'http',
      host: WEAVIATE_HOST,
      apiKey: new ApiKey(WEAVIATE_API_KEY),
    });

    // Test connection
    const meta = await client.misc.metaGetter().do();
    console.log(`✅ Connected to Weaviate v${meta.version}`);

    // Sample FSBC rates data
    const fsbcRates = [
      {
        code: 'ФЕР01-01-001-01',
        name: 'Разработка грунта с погрузкой на автомобили-самосвалы экскаваторами с ковшом вместимостью 0,5 м3, группа грунтов: 1',
        unit: 'м3',
        category: 'Земляные работы',
        workComposition: 'Разработка грунта экскаватором с погрузкой на автомобили-самосвалы',
        basePrice: 156.32,
        laborCost: 12.45,
        machineCost: 143.87,
        materialCost: 0,
        region: 'Москва',
        year: 2022,
        keywords: ['земляные работы', 'экскаватор', 'грунт', 'погрузка'],
      },
      {
        code: 'ФЕР06-01-001-01',
        name: 'Устройство бетонной подготовки толщиной 100 мм',
        unit: 'м3',
        category: 'Бетонные работы',
        workComposition: 'Укладка бетонной смеси, уплотнение, уход за бетоном',
        basePrice: 4532.15,
        laborCost: 385.23,
        machineCost: 156.78,
        materialCost: 3990.14,
        region: 'Москва',
        year: 2022,
        keywords: ['бетон', 'подготовка', 'фундамент', 'бетонные работы'],
      },
      {
        code: 'ФЕР08-02-001-01',
        name: 'Кладка стен из кирпича керамического одинарного',
        unit: 'м3',
        category: 'Каменные работы',
        workComposition: 'Кладка стен с приготовлением раствора, расшивка швов',
        basePrice: 5234.67,
        laborCost: 1856.34,
        machineCost: 234.56,
        materialCost: 3143.77,
        region: 'Москва',
        year: 2022,
        keywords: ['кирпич', 'кладка', 'стены', 'каменные работы'],
      },
      {
        code: 'ФЕР15-01-001-01',
        name: 'Штукатурка поверхностей цементно-известковым раствором по камню и бетону',
        unit: 'м2',
        category: 'Отделочные работы',
        workComposition: 'Подготовка поверхности, нанесение раствора, выравнивание',
        basePrice: 234.56,
        laborCost: 156.78,
        machineCost: 12.34,
        materialCost: 65.44,
        region: 'Москва',
        year: 2022,
        keywords: ['штукатурка', 'отделка', 'раствор', 'стены'],
      },
      {
        code: 'ФЕР26-01-001-01',
        name: 'Устройство гидроизоляции оклеечной рулонными материалами',
        unit: 'м2',
        category: 'Кровельные работы',
        workComposition: 'Подготовка основания, наклейка рулонных материалов',
        basePrice: 567.89,
        laborCost: 234.56,
        machineCost: 45.67,
        materialCost: 287.66,
        region: 'Москва',
        year: 2022,
        keywords: ['гидроизоляция', 'кровля', 'рулонные материалы'],
      },
    ];

    // Sample historical estimates
    const historicalEstimates = [
      {
        projectName: 'Строительство жилого дома по ул. Ленина, 25',
        projectType: 'Жилое строительство',
        content: 'Смета на строительство 5-этажного жилого дома',
        totalCost: 125000000,
        region: 'Москва',
        year: 2023,
        workTypes: ['земляные работы', 'фундамент', 'каменные работы', 'кровля', 'отделка'],
        usedRates: ['ФЕР01-01-001-01', 'ФЕР06-01-001-01', 'ФЕР08-02-001-01'],
        accuracy: 95.5,
      },
      {
        projectName: 'Капитальный ремонт школы №15',
        projectType: 'Общественное здание',
        content: 'Смета на капитальный ремонт здания школы',
        totalCost: 45000000,
        region: 'Москва',
        year: 2023,
        workTypes: ['демонтаж', 'отделочные работы', 'электромонтаж', 'сантехника'],
        usedRates: ['ФЕР15-01-001-01', 'ФЕР26-01-001-01'],
        accuracy: 92.3,
      },
      {
        projectName: 'Реконструкция торгового центра',
        projectType: 'Коммерческое строительство',
        content: 'Смета на реконструкцию и модернизацию ТЦ',
        totalCost: 78000000,
        region: 'Московская область',
        year: 2023,
        workTypes: ['демонтаж', 'перепланировка', 'отделка', 'фасадные работы'],
        usedRates: ['ФЕР08-02-001-01', 'ФЕР15-01-001-01'],
        accuracy: 94.1,
      },
    ];

    // Regional coefficients
    const regionalCoefficients = [
      {
        region: 'Москва',
        coefficientType: 'Заработная плата',
        value: 1.0,
        category: 'Все виды работ',
        validFrom: new Date('2022-01-01'),
        validTo: null,
        description: 'Базовый коэффициент для г. Москва',
      },
      {
        region: 'Московская область',
        coefficientType: 'Заработная плата',
        value: 0.95,
        category: 'Все виды работ',
        validFrom: new Date('2022-01-01'),
        validTo: null,
        description: 'Коэффициент для Московской области',
      },
      {
        region: 'Санкт-Петербург',
        coefficientType: 'Заработная плата',
        value: 0.98,
        category: 'Все виды работ',
        validFrom: new Date('2022-01-01'),
        validTo: null,
        description: 'Коэффициент для г. Санкт-Петербург',
      },
      {
        region: 'Сибирь',
        coefficientType: 'Климатический',
        value: 1.15,
        category: 'Земляные работы',
        validFrom: new Date('2022-01-01'),
        validTo: null,
        description: 'Климатический коэффициент для Сибири',
      },
    ];

    // Load FSBC rates
    console.log('📊 Loading FSBC rates...');
    for (const rate of fsbcRates) {
      try {
        await client.data
          .creator()
          .withClassName('FSBCRate')
          .withProperties(rate)
          .do();
      } catch (error: any) {
        console.error(`Failed to load rate ${rate.code}:`, error.message);
      }
    }
    console.log(`✅ Loaded ${fsbcRates.length} FSBC rates`);

    // Load historical estimates
    console.log('📈 Loading historical estimates...');
    for (const estimate of historicalEstimates) {
      try {
        await client.data
          .creator()
          .withClassName('HistoricalEstimate')
          .withProperties(estimate)
          .do();
      } catch (error: any) {
        console.error(`Failed to load estimate ${estimate.projectName}:`, error.message);
      }
    }
    console.log(`✅ Loaded ${historicalEstimates.length} historical estimates`);

    // Load regional coefficients
    console.log('🌍 Loading regional coefficients...');
    for (const coefficient of regionalCoefficients) {
      try {
        await client.data
          .creator()
          .withClassName('RegionalCoefficient')
          .withProperties(coefficient)
          .do();
      } catch (error: any) {
        console.error(`Failed to load coefficient for ${coefficient.region}:`, error.message);
      }
    }
    console.log(`✅ Loaded ${regionalCoefficients.length} regional coefficients`);

    console.log('🎉 Weaviate initialization completed successfully!');
  } catch (error) {
    console.error('❌ Error initializing Weaviate:', error);
    process.exit(1);
  }
}

// Run initialization
initializeWeaviateData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
