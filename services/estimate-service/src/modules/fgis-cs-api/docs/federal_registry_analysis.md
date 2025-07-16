# Federal Registry of Cost Estimation Standards - XML Data Analysis

## Overview
The XML file contains a list of construction cost estimation standards and related resources from the Russian Ministry of Construction (Минстрой России). The data follows the open data standard version 3.0 from data.gov.ru.

## Structure Analysis

### Root Elements
- `<list>` - Root container
- `<standardversion>` - References the open data publication methodology version 3.0
- `<meta>` - Contains all dataset items

### Item Structure
Each dataset is represented as an `<item>` with the following fields:
- `identifier` - Unique ID for the dataset (format: 7707082071-[dataset_name])
- `title` - Russian title describing the dataset
- `link` - URL to access the metadata file
- `format` - File format (csv or xml)

## Available Datasets

### 1. Construction Resources and Materials
- **КСР (Классификатор строительных ресурсов)** - Construction Resources Classifier
  - ID: 7707082071-ksr
  - Format: CSV
  - Link: https://fgiscs.minstroyrf.ru/api/opendata/7707082071-ksr/meta.csv

### 2. Federal Cost Standards (ФСНБ)
- **ФСНБ-2020** - Federal Construction Cost Standards 2020
  - ID: 7707082071-fsnb2020
  - Format: XML
  - Link: https://fgiscs.minstroyrf.ru/api/opendata/7707082071-fsnb2020/meta.xml

- **ФСНБ-2022** - Federal Construction Cost Standards 2022
  - ID: 7707082071-fsnb2022
  - Format: XML
  - Link: https://fgiscs.minstroyrf.ru/api/opendata/7707082071-fsnb2022/meta.xml

### 3. Labor Costs
- **Среднемесячные размеры оплаты труда** - Average Monthly Labor Costs
  - ID: 7707082071-OplataTruda
  - Format: CSV
  - Link: https://fgiscs.minstroyrf.ru/api/opendata/7707082071-OplataTruda/meta.csv

### 4. Price Zones
- **Ценовые зоны** - Price Zones
  - ID: 7707082071-PriceZones
  - Format: CSV
  - Link: https://fgiscs.minstroyrf.ru/api/opendata/7707082071-PriceZones/meta.csv

### 5. Industry-Specific Cost Standards (ПССР)
Multiple industry-specific construction cost standards:

- **Алмазодобывающая промышленность** - Diamond Mining Industry
  - ID: 7707082071-pssralmaz
  
- **Атомная энергия** - Nuclear Energy
  - ID: 7707082071-pssratom
  
- **Автомобильные дороги** - Road Construction
  - ID: 7707082071-pssravtodor
  
- **Ракетно-космическая промышленность** - Space Industry
  - ID: 7707082071-pssrcosmos
  
- **Электроэнергетика** - Electric Power
  - ID: 7707082071-pssrelectroenergo
  
- **Транспорт нефти** - Oil Transport
  - ID: 7707082071-pssrneft
  
- **Железнодорожный транспорт** - Railway Transport
  - ID: 7707082071-pssrzheldor

All ПССР datasets are in CSV format.

### 6. Special Construction Resources
- **СПСРП** - Special Construction Resources Prices
  - ID: 7707082071-spsrp
  - Format: CSV

### 7. Technology Groups
- **База технологических групп** - Technology Groups Database
  - ID: 7707082071-TechGroups
  - Format: XML
  
- **Технологические группы по техническим частям** - Technology Groups by Technical Parts
  - ID: 7707082071-TechGroupsPart
  - Format: CSV

### 8. Other Resources
- **Реестр сайтов с ссылками на карьеры** - Registry of quarries and ash waste storage sites
  - ID: 7707082071-careers
  - Format: CSV

## Key Findings

1. **Data Formats**: The registry uses two primary formats:
   - CSV for most datasets (labor costs, price zones, industry standards)
   - XML for complex hierarchical data (ФСНБ standards, technology groups)

2. **Naming Convention**: All identifiers follow the pattern `7707082071-[dataset_name]` where 7707082071 appears to be the organization identifier.

3. **Access Pattern**: All data is accessible via HTTPS URLs at the domain `fgiscs.minstroyrf.ru` with the API endpoint pattern `/api/opendata/[identifier]/meta.[format]`

4. **Content Types**:
   - Price databases (ФСНБ-2020, ФСНБ-2022)
   - Classification systems (КСР, Technology Groups)
   - Regional data (Price Zones, Labor Costs)
   - Industry-specific standards (7 different industries)

5. **Data Issues Found**:
   - Line 18: Extra space in identifier ` 7707082071-fsnb2022`
   - Line 20: Extra space in URL path

## Next Steps for Data Processing

To work with this data effectively, you would need to:

1. **Download Metadata Files**: Use the provided links to download the actual metadata files for each dataset
2. **Parse Format-Specific Data**: 
   - CSV files can be parsed directly into tabular format
   - XML files will need XML parsing to extract structured data
3. **Data Integration**: The datasets appear to be related (e.g., КСР classifier used in ФСНБ standards)
4. **Handle Encoding**: All data appears to be in UTF-8 encoding with Russian language content

## Database Schema Alignment

The parsed data aligns well with the Prisma schema tables:
- `PriceBase` model → ФСНБ-2020/2022 datasets
- `ConstructionResource` model → КСР dataset
- `PriceZone` model → Price Zones dataset
- `LaborCost` model → Labor Costs dataset
- `IndustryPriceBase` model → ПССР datasets
- `TechGroup` model → Technology Groups datasets
