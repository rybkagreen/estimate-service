-- =============================================
-- НОРМАТИВНЫЕ БАЗЫ ДАННЫХ ДЛЯ СТРОИТЕЛЬСТВА
-- =============================================

-- ГЭСН (Государственные элементные сметные нормы)
-- Содержит нормы затрат труда, времени работы машин и расхода материалов
CREATE TABLE IF NOT EXISTS "gesn_items" (
  "id" TEXT NOT NULL,
  "code" VARCHAR(50) NOT NULL,
  "name" TEXT NOT NULL,
  "unit" VARCHAR(50) NOT NULL,
  "labor_hours" DECIMAL(10,3) NOT NULL DEFAULT 0, -- Затраты труда рабочих (чел.-ч)
  "machine_hours" DECIMAL(10,3) NOT NULL DEFAULT 0, -- Время использования машин (маш.-ч)
  "chapter" VARCHAR(10),
  "section" VARCHAR(200),
  "complexity" VARCHAR(50), -- Группа сложности работ
  "conditions" TEXT, -- Условия выполнения работ
  "region_code" VARCHAR(10),
  "valid_from" TIMESTAMP(3) NOT NULL,
  "valid_to" TIMESTAMP(3),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "version" VARCHAR(20) NOT NULL DEFAULT '1.0',
  "source" VARCHAR(500),
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "gesn_items_pkey" PRIMARY KEY ("id")
);

-- Материалы для ГЭСН
CREATE TABLE IF NOT EXISTS "gesn_materials" (
  "id" TEXT NOT NULL,
  "gesn_item_id" TEXT NOT NULL,
  "material_code" VARCHAR(50) NOT NULL,
  "material_name" TEXT NOT NULL,
  "unit" VARCHAR(50) NOT NULL,
  "consumption" DECIMAL(15,6) NOT NULL, -- Расход на единицу измерения
  "waste_coefficient" DECIMAL(5,3) DEFAULT 1.0, -- Коэффициент отходов
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "gesn_materials_pkey" PRIMARY KEY ("id")
);

-- ФЕР (Федеральные единичные расценки)
CREATE TABLE IF NOT EXISTS "fer_items" (
  "id" TEXT NOT NULL,
  "code" VARCHAR(50) NOT NULL,
  "name" TEXT NOT NULL,
  "unit" VARCHAR(50) NOT NULL,
  "base_price" DECIMAL(12,2) NOT NULL,
  "labor_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "machine_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "material_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "overhead_cost" DECIMAL(12,2) NOT NULL DEFAULT 0, -- Накладные расходы
  "profit_cost" DECIMAL(12,2) NOT NULL DEFAULT 0, -- Сметная прибыль
  "chapter" VARCHAR(10),
  "section" VARCHAR(200),
  "subsection" VARCHAR(200),
  "valid_from" TIMESTAMP(3) NOT NULL,
  "valid_to" TIMESTAMP(3),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "version" VARCHAR(20) NOT NULL DEFAULT '1.0',
  "source" VARCHAR(500),
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "fer_items_pkey" PRIMARY KEY ("id")
);

-- ТЕР (Территориальные единичные расценки)
CREATE TABLE IF NOT EXISTS "ter_items" (
  "id" TEXT NOT NULL,
  "code" VARCHAR(50) NOT NULL,
  "name" TEXT NOT NULL,
  "unit" VARCHAR(50) NOT NULL,
  "base_price" DECIMAL(12,2) NOT NULL,
  "labor_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "machine_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "material_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "overhead_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "profit_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "region_code" VARCHAR(10) NOT NULL,
  "region_name" VARCHAR(200) NOT NULL,
  "chapter" VARCHAR(10),
  "section" VARCHAR(200),
  "subsection" VARCHAR(200),
  "valid_from" TIMESTAMP(3) NOT NULL,
  "valid_to" TIMESTAMP(3),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "version" VARCHAR(20) NOT NULL DEFAULT '1.0',
  "source" VARCHAR(500),
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ter_items_pkey" PRIMARY KEY ("id")
);

-- ТСН (Территориальные сметные нормативы)
CREATE TABLE IF NOT EXISTS "tsn_items" (
  "id" TEXT NOT NULL,
  "code" VARCHAR(50) NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "normative_type" VARCHAR(50) NOT NULL, -- Тип норматива
  "region_code" VARCHAR(10) NOT NULL,
  "region_name" VARCHAR(200) NOT NULL,
  "application_area" TEXT, -- Область применения
  "calculation_base" TEXT, -- База для расчета
  "coefficient" DECIMAL(6,3) DEFAULT 1.0,
  "formula" TEXT, -- Формула расчета
  "conditions" TEXT, -- Условия применения
  "valid_from" TIMESTAMP(3) NOT NULL,
  "valid_to" TIMESTAMP(3),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "version" VARCHAR(20) NOT NULL DEFAULT '1.0',
  "approved_by" VARCHAR(500), -- Кем утвержден
  "approval_date" TIMESTAMP(3),
  "document_number" VARCHAR(200), -- Номер документа
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "tsn_items_pkey" PRIMARY KEY ("id")
);

-- ФССЦ (Федеральные сборники сметных цен)
CREATE TABLE IF NOT EXISTS "fssc_items" (
  "id" TEXT NOT NULL,
  "code" VARCHAR(50) NOT NULL,
  "name" TEXT NOT NULL,
  "unit" VARCHAR(50) NOT NULL,
  "base_price" DECIMAL(12,2) NOT NULL,
  "price_without_vat" DECIMAL(12,2) NOT NULL,
  "transportation_cost" DECIMAL(12,2) DEFAULT 0,
  "storage_cost" DECIMAL(12,2) DEFAULT 0,
  "material_group" VARCHAR(200), -- Группа материала
  "material_type" VARCHAR(200), -- Тип материала
  "manufacturer" VARCHAR(500), -- Производитель
  "gost_tu" VARCHAR(200), -- ГОСТ/ТУ
  "characteristics" TEXT, -- Технические характеристики
  "valid_from" TIMESTAMP(3) NOT NULL,
  "valid_to" TIMESTAMP(3),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "version" VARCHAR(20) NOT NULL DEFAULT '1.0',
  "source" VARCHAR(500),
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "fssc_items_pkey" PRIMARY KEY ("id")
);

-- ТССЦ (Территориальные сборники сметных цен)
CREATE TABLE IF NOT EXISTS "tssc_items" (
  "id" TEXT NOT NULL,
  "code" VARCHAR(50) NOT NULL,
  "name" TEXT NOT NULL,
  "unit" VARCHAR(50) NOT NULL,
  "base_price" DECIMAL(12,2) NOT NULL,
  "price_without_vat" DECIMAL(12,2) NOT NULL,
  "transportation_cost" DECIMAL(12,2) DEFAULT 0,
  "storage_cost" DECIMAL(12,2) DEFAULT 0,
  "region_code" VARCHAR(10) NOT NULL,
  "region_name" VARCHAR(200) NOT NULL,
  "material_group" VARCHAR(200),
  "material_type" VARCHAR(200),
  "local_manufacturer" VARCHAR(500), -- Местный производитель
  "delivery_conditions" TEXT, -- Условия поставки
  "gost_tu" VARCHAR(200),
  "characteristics" TEXT,
  "valid_from" TIMESTAMP(3) NOT NULL,
  "valid_to" TIMESTAMP(3),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "version" VARCHAR(20) NOT NULL DEFAULT '1.0',
  "source" VARCHAR(500),
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "tssc_items_pkey" PRIMARY KEY ("id")
);

-- Индексные коэффициенты пересчета
CREATE TABLE IF NOT EXISTS "index_coefficients" (
  "id" TEXT NOT NULL,
  "coefficient_type" VARCHAR(50) NOT NULL, -- labor, material, machine, etc.
  "base_period" VARCHAR(20) NOT NULL, -- Базовый период (например, "2001")
  "target_period" VARCHAR(20) NOT NULL, -- Целевой период (например, "2024-Q1")
  "region_code" VARCHAR(10),
  "region_name" VARCHAR(200),
  "construction_type" VARCHAR(100), -- Тип строительства
  "coefficient_value" DECIMAL(8,4) NOT NULL,
  "calculation_method" TEXT, -- Методика расчета
  "approved_by" VARCHAR(500),
  "approval_date" TIMESTAMP(3),
  "document_number" VARCHAR(200),
  "valid_from" TIMESTAMP(3) NOT NULL,
  "valid_to" TIMESTAMP(3),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "index_coefficients_pkey" PRIMARY KEY ("id")
);

-- Нормативы накладных расходов и сметной прибыли
CREATE TABLE IF NOT EXISTS "overhead_profit_norms" (
  "id" TEXT NOT NULL,
  "work_type" VARCHAR(200) NOT NULL, -- Тип работ
  "construction_type" VARCHAR(100), -- Тип строительства
  "overhead_norm" DECIMAL(6,2) NOT NULL, -- Норматив накладных расходов (%)
  "profit_norm" DECIMAL(6,2) NOT NULL, -- Норматив сметной прибыли (%)
  "calculation_base" VARCHAR(50), -- База исчисления (от ФОТ, от ПЗ и т.д.)
  "region_code" VARCHAR(10),
  "conditions" TEXT, -- Условия применения
  "document_reference" VARCHAR(500), -- Ссылка на нормативный документ
  "valid_from" TIMESTAMP(3) NOT NULL,
  "valid_to" TIMESTAMP(3),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "overhead_profit_norms_pkey" PRIMARY KEY ("id")
);

-- История изменений нормативов
CREATE TABLE IF NOT EXISTS "normative_history" (
  "id" TEXT NOT NULL,
  "table_name" VARCHAR(50) NOT NULL,
  "record_id" TEXT NOT NULL,
  "change_type" VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE
  "old_values" JSONB,
  "new_values" JSONB,
  "changed_by" TEXT,
  "change_reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "normative_history_pkey" PRIMARY KEY ("id")
);

-- Создание индексов
CREATE UNIQUE INDEX "gesn_items_code_region_code_valid_from_key" ON "gesn_items"("code", "region_code", "valid_from");
CREATE INDEX "gesn_items_code_idx" ON "gesn_items"("code");
CREATE INDEX "gesn_items_chapter_idx" ON "gesn_items"("chapter");
CREATE INDEX "gesn_items_is_active_idx" ON "gesn_items"("is_active");
CREATE INDEX "gesn_items_valid_from_valid_to_idx" ON "gesn_items"("valid_from", "valid_to");

CREATE INDEX "gesn_materials_gesn_item_id_idx" ON "gesn_materials"("gesn_item_id");
CREATE INDEX "gesn_materials_material_code_idx" ON "gesn_materials"("material_code");

CREATE UNIQUE INDEX "fer_items_code_valid_from_key" ON "fer_items"("code", "valid_from");
CREATE INDEX "fer_items_code_idx" ON "fer_items"("code");
CREATE INDEX "fer_items_chapter_idx" ON "fer_items"("chapter");
CREATE INDEX "fer_items_is_active_idx" ON "fer_items"("is_active");
CREATE INDEX "fer_items_valid_from_valid_to_idx" ON "fer_items"("valid_from", "valid_to");

CREATE UNIQUE INDEX "ter_items_code_region_code_valid_from_key" ON "ter_items"("code", "region_code", "valid_from");
CREATE INDEX "ter_items_code_idx" ON "ter_items"("code");
CREATE INDEX "ter_items_region_code_idx" ON "ter_items"("region_code");
CREATE INDEX "ter_items_chapter_idx" ON "ter_items"("chapter");
CREATE INDEX "ter_items_is_active_idx" ON "ter_items"("is_active");

CREATE UNIQUE INDEX "tsn_items_code_region_code_valid_from_key" ON "tsn_items"("code", "region_code", "valid_from");
CREATE INDEX "tsn_items_region_code_idx" ON "tsn_items"("region_code");
CREATE INDEX "tsn_items_normative_type_idx" ON "tsn_items"("normative_type");
CREATE INDEX "tsn_items_is_active_idx" ON "tsn_items"("is_active");

CREATE UNIQUE INDEX "fssc_items_code_valid_from_key" ON "fssc_items"("code", "valid_from");
CREATE INDEX "fssc_items_code_idx" ON "fssc_items"("code");
CREATE INDEX "fssc_items_material_group_idx" ON "fssc_items"("material_group");
CREATE INDEX "fssc_items_is_active_idx" ON "fssc_items"("is_active");

CREATE UNIQUE INDEX "tssc_items_code_region_code_valid_from_key" ON "tssc_items"("code", "region_code", "valid_from");
CREATE INDEX "tssc_items_code_idx" ON "tssc_items"("code");
CREATE INDEX "tssc_items_region_code_idx" ON "tssc_items"("region_code");
CREATE INDEX "tssc_items_material_group_idx" ON "tssc_items"("material_group");

CREATE UNIQUE INDEX "index_coefficients_type_periods_region_key" ON "index_coefficients"("coefficient_type", "base_period", "target_period", "region_code", "construction_type");
CREATE INDEX "index_coefficients_coefficient_type_idx" ON "index_coefficients"("coefficient_type");
CREATE INDEX "index_coefficients_region_code_idx" ON "index_coefficients"("region_code");
CREATE INDEX "index_coefficients_target_period_idx" ON "index_coefficients"("target_period");

CREATE INDEX "overhead_profit_norms_work_type_idx" ON "overhead_profit_norms"("work_type");
CREATE INDEX "overhead_profit_norms_region_code_idx" ON "overhead_profit_norms"("region_code");

CREATE INDEX "normative_history_table_name_record_id_idx" ON "normative_history"("table_name", "record_id");
CREATE INDEX "normative_history_created_at_idx" ON "normative_history"("created_at");

-- Добавление Foreign Keys
ALTER TABLE "gesn_materials" ADD CONSTRAINT "gesn_materials_gesn_item_id_fkey" 
  FOREIGN KEY ("gesn_item_id") REFERENCES "gesn_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
