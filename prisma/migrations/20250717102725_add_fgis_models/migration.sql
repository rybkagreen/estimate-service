/*
  Warnings:

  - You are about to drop the column `base_price` on the `fer_items` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `fer_items` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `fer_items` table. All the data in the column will be lost.
  - You are about to drop the column `labor_cost` on the `fer_items` table. All the data in the column will be lost.
  - You are about to drop the column `machine_cost` on the `fer_items` table. All the data in the column will be lost.
  - You are about to drop the column `material_cost` on the `fer_items` table. All the data in the column will be lost.
  - You are about to drop the column `overhead_cost` on the `fer_items` table. All the data in the column will be lost.
  - You are about to drop the column `profit_cost` on the `fer_items` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `fer_items` table. All the data in the column will be lost.
  - You are about to drop the column `valid_from` on the `fer_items` table. All the data in the column will be lost.
  - You are about to drop the column `valid_to` on the `fer_items` table. All the data in the column will be lost.
  - You are about to drop the column `base_price` on the `fssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `fssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `gost_tu` on the `fssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `fssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `material_group` on the `fssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `material_type` on the `fssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `price_without_vat` on the `fssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `storage_cost` on the `fssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `transportation_cost` on the `fssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `fssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `valid_from` on the `fssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `valid_to` on the `fssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `gesn_items` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `gesn_items` table. All the data in the column will be lost.
  - You are about to drop the column `labor_hours` on the `gesn_items` table. All the data in the column will be lost.
  - You are about to drop the column `machine_hours` on the `gesn_items` table. All the data in the column will be lost.
  - You are about to drop the column `region_code` on the `gesn_items` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `gesn_items` table. All the data in the column will be lost.
  - You are about to drop the column `valid_from` on the `gesn_items` table. All the data in the column will be lost.
  - You are about to drop the column `valid_to` on the `gesn_items` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `gesn_materials` table. All the data in the column will be lost.
  - You are about to drop the column `gesn_item_id` on the `gesn_materials` table. All the data in the column will be lost.
  - You are about to drop the column `material_code` on the `gesn_materials` table. All the data in the column will be lost.
  - You are about to drop the column `material_name` on the `gesn_materials` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `gesn_materials` table. All the data in the column will be lost.
  - You are about to drop the column `waste_coefficient` on the `gesn_materials` table. All the data in the column will be lost.
  - You are about to drop the column `approval_date` on the `index_coefficients` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by` on the `index_coefficients` table. All the data in the column will be lost.
  - You are about to drop the column `base_period` on the `index_coefficients` table. All the data in the column will be lost.
  - You are about to drop the column `calculation_method` on the `index_coefficients` table. All the data in the column will be lost.
  - You are about to drop the column `coefficient_type` on the `index_coefficients` table. All the data in the column will be lost.
  - You are about to drop the column `coefficient_value` on the `index_coefficients` table. All the data in the column will be lost.
  - You are about to drop the column `construction_type` on the `index_coefficients` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `index_coefficients` table. All the data in the column will be lost.
  - You are about to drop the column `document_number` on the `index_coefficients` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `index_coefficients` table. All the data in the column will be lost.
  - You are about to drop the column `region_code` on the `index_coefficients` table. All the data in the column will be lost.
  - You are about to drop the column `region_name` on the `index_coefficients` table. All the data in the column will be lost.
  - You are about to drop the column `target_period` on the `index_coefficients` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `index_coefficients` table. All the data in the column will be lost.
  - You are about to drop the column `valid_from` on the `index_coefficients` table. All the data in the column will be lost.
  - You are about to drop the column `valid_to` on the `index_coefficients` table. All the data in the column will be lost.
  - You are about to drop the column `change_reason` on the `normative_history` table. All the data in the column will be lost.
  - You are about to drop the column `change_type` on the `normative_history` table. All the data in the column will be lost.
  - You are about to drop the column `changed_by` on the `normative_history` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `normative_history` table. All the data in the column will be lost.
  - You are about to drop the column `new_values` on the `normative_history` table. All the data in the column will be lost.
  - You are about to drop the column `old_values` on the `normative_history` table. All the data in the column will be lost.
  - You are about to drop the column `record_id` on the `normative_history` table. All the data in the column will be lost.
  - You are about to drop the column `table_name` on the `normative_history` table. All the data in the column will be lost.
  - You are about to drop the column `calculation_base` on the `overhead_profit_norms` table. All the data in the column will be lost.
  - You are about to drop the column `construction_type` on the `overhead_profit_norms` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `overhead_profit_norms` table. All the data in the column will be lost.
  - You are about to drop the column `document_reference` on the `overhead_profit_norms` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `overhead_profit_norms` table. All the data in the column will be lost.
  - You are about to drop the column `overhead_norm` on the `overhead_profit_norms` table. All the data in the column will be lost.
  - You are about to drop the column `profit_norm` on the `overhead_profit_norms` table. All the data in the column will be lost.
  - You are about to drop the column `region_code` on the `overhead_profit_norms` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `overhead_profit_norms` table. All the data in the column will be lost.
  - You are about to drop the column `valid_from` on the `overhead_profit_norms` table. All the data in the column will be lost.
  - You are about to drop the column `valid_to` on the `overhead_profit_norms` table. All the data in the column will be lost.
  - You are about to drop the column `work_type` on the `overhead_profit_norms` table. All the data in the column will be lost.
  - You are about to drop the column `base_price` on the `ter_items` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `ter_items` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `ter_items` table. All the data in the column will be lost.
  - You are about to drop the column `labor_cost` on the `ter_items` table. All the data in the column will be lost.
  - You are about to drop the column `machine_cost` on the `ter_items` table. All the data in the column will be lost.
  - You are about to drop the column `material_cost` on the `ter_items` table. All the data in the column will be lost.
  - You are about to drop the column `overhead_cost` on the `ter_items` table. All the data in the column will be lost.
  - You are about to drop the column `profit_cost` on the `ter_items` table. All the data in the column will be lost.
  - You are about to drop the column `region_code` on the `ter_items` table. All the data in the column will be lost.
  - You are about to drop the column `region_name` on the `ter_items` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `ter_items` table. All the data in the column will be lost.
  - You are about to drop the column `valid_from` on the `ter_items` table. All the data in the column will be lost.
  - You are about to drop the column `valid_to` on the `ter_items` table. All the data in the column will be lost.
  - You are about to drop the column `application_area` on the `tsn_items` table. All the data in the column will be lost.
  - You are about to drop the column `approval_date` on the `tsn_items` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by` on the `tsn_items` table. All the data in the column will be lost.
  - You are about to drop the column `calculation_base` on the `tsn_items` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `tsn_items` table. All the data in the column will be lost.
  - You are about to drop the column `document_number` on the `tsn_items` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `tsn_items` table. All the data in the column will be lost.
  - You are about to drop the column `normative_type` on the `tsn_items` table. All the data in the column will be lost.
  - You are about to drop the column `region_code` on the `tsn_items` table. All the data in the column will be lost.
  - You are about to drop the column `region_name` on the `tsn_items` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `tsn_items` table. All the data in the column will be lost.
  - You are about to drop the column `valid_from` on the `tsn_items` table. All the data in the column will be lost.
  - You are about to drop the column `valid_to` on the `tsn_items` table. All the data in the column will be lost.
  - You are about to drop the column `base_price` on the `tssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `tssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `delivery_conditions` on the `tssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `gost_tu` on the `tssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `tssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `local_manufacturer` on the `tssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `material_group` on the `tssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `material_type` on the `tssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `price_without_vat` on the `tssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `region_code` on the `tssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `region_name` on the `tssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `storage_cost` on the `tssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `transportation_cost` on the `tssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `tssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `valid_from` on the `tssc_items` table. All the data in the column will be lost.
  - You are about to drop the column `valid_to` on the `tssc_items` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code,validFrom]` on the table `fer_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code,validFrom]` on the table `fssc_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code,regionCode,validFrom]` on the table `gesn_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[coefficientType,basePeriod,targetPeriod,regionCode,constructionType]` on the table `index_coefficients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code,regionCode,validFrom]` on the table `ter_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code,regionCode,validFrom]` on the table `tsn_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code,regionCode,validFrom]` on the table `tssc_items` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `basePrice` to the `fer_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `laborCost` to the `fer_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `machineCost` to the `fer_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `materialCost` to the `fer_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overheadCost` to the `fer_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profitCost` to the `fer_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `fer_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validFrom` to the `fer_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `basePrice` to the `fssc_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceWithoutVAT` to the `fssc_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `fssc_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validFrom` to the `fssc_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `laborHours` to the `gesn_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `machineHours` to the `gesn_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `gesn_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validFrom` to the `gesn_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gesnItemId` to the `gesn_materials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `materialCode` to the `gesn_materials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `materialName` to the `gesn_materials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `gesn_materials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `basePeriod` to the `index_coefficients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coefficientType` to the `index_coefficients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coefficientValue` to the `index_coefficients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetPeriod` to the `index_coefficients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `index_coefficients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validFrom` to the `index_coefficients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `changeType` to the `normative_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordId` to the `normative_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tableName` to the `normative_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overheadNorm` to the `overhead_profit_norms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profitNorm` to the `overhead_profit_norms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `overhead_profit_norms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validFrom` to the `overhead_profit_norms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workType` to the `overhead_profit_norms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `basePrice` to the `ter_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `laborCost` to the `ter_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `machineCost` to the `ter_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `materialCost` to the `ter_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overheadCost` to the `ter_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profitCost` to the `ter_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regionCode` to the `ter_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regionName` to the `ter_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ter_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validFrom` to the `ter_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `normativeType` to the `tsn_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regionCode` to the `tsn_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regionName` to the `tsn_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tsn_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validFrom` to the `tsn_items` table without a default value. This is not possible if the table is not empty.
  - Made the column `coefficient` on table `tsn_items` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `basePrice` to the `tssc_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceWithoutVAT` to the `tssc_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regionCode` to the `tssc_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regionName` to the `tssc_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tssc_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validFrom` to the `tssc_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "gesn_materials" DROP CONSTRAINT "gesn_materials_gesn_item_id_fkey";

-- DropIndex
DROP INDEX "fer_items_chapter_idx";

-- DropIndex
DROP INDEX "fer_items_code_idx";

-- DropIndex
DROP INDEX "fer_items_code_valid_from_key";

-- DropIndex
DROP INDEX "fer_items_is_active_idx";

-- DropIndex
DROP INDEX "fer_items_valid_from_valid_to_idx";

-- DropIndex
DROP INDEX "fssc_items_code_idx";

-- DropIndex
DROP INDEX "fssc_items_code_valid_from_key";

-- DropIndex
DROP INDEX "fssc_items_is_active_idx";

-- DropIndex
DROP INDEX "fssc_items_material_group_idx";

-- DropIndex
DROP INDEX "gesn_items_chapter_idx";

-- DropIndex
DROP INDEX "gesn_items_code_idx";

-- DropIndex
DROP INDEX "gesn_items_code_region_code_valid_from_key";

-- DropIndex
DROP INDEX "gesn_items_is_active_idx";

-- DropIndex
DROP INDEX "gesn_items_valid_from_valid_to_idx";

-- DropIndex
DROP INDEX "gesn_materials_gesn_item_id_idx";

-- DropIndex
DROP INDEX "gesn_materials_material_code_idx";

-- DropIndex
DROP INDEX "index_coefficients_coefficient_type_idx";

-- DropIndex
DROP INDEX "index_coefficients_region_code_idx";

-- DropIndex
DROP INDEX "index_coefficients_target_period_idx";

-- DropIndex
DROP INDEX "index_coefficients_type_periods_region_key";

-- DropIndex
DROP INDEX "normative_history_created_at_idx";

-- DropIndex
DROP INDEX "normative_history_table_name_record_id_idx";

-- DropIndex
DROP INDEX "overhead_profit_norms_region_code_idx";

-- DropIndex
DROP INDEX "overhead_profit_norms_work_type_idx";

-- DropIndex
DROP INDEX "ter_items_chapter_idx";

-- DropIndex
DROP INDEX "ter_items_code_idx";

-- DropIndex
DROP INDEX "ter_items_code_region_code_valid_from_key";

-- DropIndex
DROP INDEX "ter_items_is_active_idx";

-- DropIndex
DROP INDEX "ter_items_region_code_idx";

-- DropIndex
DROP INDEX "tsn_items_code_region_code_valid_from_key";

-- DropIndex
DROP INDEX "tsn_items_is_active_idx";

-- DropIndex
DROP INDEX "tsn_items_normative_type_idx";

-- DropIndex
DROP INDEX "tsn_items_region_code_idx";

-- DropIndex
DROP INDEX "tssc_items_code_idx";

-- DropIndex
DROP INDEX "tssc_items_code_region_code_valid_from_key";

-- DropIndex
DROP INDEX "tssc_items_material_group_idx";

-- DropIndex
DROP INDEX "tssc_items_region_code_idx";

-- AlterTable
ALTER TABLE "fer_items" DROP COLUMN "base_price",
DROP COLUMN "created_at",
DROP COLUMN "is_active",
DROP COLUMN "labor_cost",
DROP COLUMN "machine_cost",
DROP COLUMN "material_cost",
DROP COLUMN "overhead_cost",
DROP COLUMN "profit_cost",
DROP COLUMN "updated_at",
DROP COLUMN "valid_from",
DROP COLUMN "valid_to",
ADD COLUMN     "basePrice" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "laborCost" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "machineCost" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "materialCost" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "overheadCost" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "profitCost" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validTo" TIMESTAMP(3),
ALTER COLUMN "chapter" SET DATA TYPE TEXT,
ALTER COLUMN "section" SET DATA TYPE TEXT,
ALTER COLUMN "subsection" SET DATA TYPE TEXT,
ALTER COLUMN "version" SET DATA TYPE TEXT,
ALTER COLUMN "source" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "fssc_items" DROP COLUMN "base_price",
DROP COLUMN "created_at",
DROP COLUMN "gost_tu",
DROP COLUMN "is_active",
DROP COLUMN "material_group",
DROP COLUMN "material_type",
DROP COLUMN "price_without_vat",
DROP COLUMN "storage_cost",
DROP COLUMN "transportation_cost",
DROP COLUMN "updated_at",
DROP COLUMN "valid_from",
DROP COLUMN "valid_to",
ADD COLUMN     "basePrice" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "gstTu" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "materialGroup" TEXT,
ADD COLUMN     "materialType" TEXT,
ADD COLUMN     "priceWithoutVAT" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "storageCost" DECIMAL(12,2),
ADD COLUMN     "transportationCost" DECIMAL(12,2),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validTo" TIMESTAMP(3),
ALTER COLUMN "manufacturer" SET DATA TYPE TEXT,
ALTER COLUMN "version" SET DATA TYPE TEXT,
ALTER COLUMN "source" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "gesn_items" DROP COLUMN "created_at",
DROP COLUMN "is_active",
DROP COLUMN "labor_hours",
DROP COLUMN "machine_hours",
DROP COLUMN "region_code",
DROP COLUMN "updated_at",
DROP COLUMN "valid_from",
DROP COLUMN "valid_to",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "laborHours" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "machineHours" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "regionCode" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validTo" TIMESTAMP(3),
ALTER COLUMN "chapter" SET DATA TYPE TEXT,
ALTER COLUMN "section" SET DATA TYPE TEXT,
ALTER COLUMN "complexity" SET DATA TYPE TEXT,
ALTER COLUMN "version" SET DATA TYPE TEXT,
ALTER COLUMN "source" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "gesn_materials" DROP COLUMN "created_at",
DROP COLUMN "gesn_item_id",
DROP COLUMN "material_code",
DROP COLUMN "material_name",
DROP COLUMN "updated_at",
DROP COLUMN "waste_coefficient",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "gesnItemId" TEXT NOT NULL,
ADD COLUMN     "materialCode" VARCHAR(50) NOT NULL,
ADD COLUMN     "materialName" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "wasteCoefficient" DECIMAL(65,30) NOT NULL DEFAULT 1.0;

-- AlterTable
ALTER TABLE "index_coefficients" DROP COLUMN "approval_date",
DROP COLUMN "approved_by",
DROP COLUMN "base_period",
DROP COLUMN "calculation_method",
DROP COLUMN "coefficient_type",
DROP COLUMN "coefficient_value",
DROP COLUMN "construction_type",
DROP COLUMN "created_at",
DROP COLUMN "document_number",
DROP COLUMN "is_active",
DROP COLUMN "region_code",
DROP COLUMN "region_name",
DROP COLUMN "target_period",
DROP COLUMN "updated_at",
DROP COLUMN "valid_from",
DROP COLUMN "valid_to",
ADD COLUMN     "approvalDate" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "basePeriod" VARCHAR(20) NOT NULL,
ADD COLUMN     "calculationMethod" TEXT,
ADD COLUMN     "coefficientType" VARCHAR(50) NOT NULL,
ADD COLUMN     "coefficientValue" DECIMAL(8,4) NOT NULL,
ADD COLUMN     "constructionType" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "documentNumber" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "regionCode" VARCHAR(10),
ADD COLUMN     "regionName" TEXT,
ADD COLUMN     "targetPeriod" VARCHAR(20) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validTo" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "normative_history" DROP COLUMN "change_reason",
DROP COLUMN "change_type",
DROP COLUMN "changed_by",
DROP COLUMN "created_at",
DROP COLUMN "new_values",
DROP COLUMN "old_values",
DROP COLUMN "record_id",
DROP COLUMN "table_name",
ADD COLUMN     "changeReason" TEXT,
ADD COLUMN     "changeType" VARCHAR(20) NOT NULL,
ADD COLUMN     "changedBy" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "newValues" JSONB,
ADD COLUMN     "oldValues" JSONB,
ADD COLUMN     "recordId" TEXT NOT NULL,
ADD COLUMN     "tableName" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "overhead_profit_norms" DROP COLUMN "calculation_base",
DROP COLUMN "construction_type",
DROP COLUMN "created_at",
DROP COLUMN "document_reference",
DROP COLUMN "is_active",
DROP COLUMN "overhead_norm",
DROP COLUMN "profit_norm",
DROP COLUMN "region_code",
DROP COLUMN "updated_at",
DROP COLUMN "valid_from",
DROP COLUMN "valid_to",
DROP COLUMN "work_type",
ADD COLUMN     "calculationBase" TEXT,
ADD COLUMN     "constructionType" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "documentReference" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "overheadNorm" DECIMAL(6,2) NOT NULL,
ADD COLUMN     "profitNorm" DECIMAL(6,2) NOT NULL,
ADD COLUMN     "regionCode" VARCHAR(10),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validTo" TIMESTAMP(3),
ADD COLUMN     "workType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ter_items" DROP COLUMN "base_price",
DROP COLUMN "created_at",
DROP COLUMN "is_active",
DROP COLUMN "labor_cost",
DROP COLUMN "machine_cost",
DROP COLUMN "material_cost",
DROP COLUMN "overhead_cost",
DROP COLUMN "profit_cost",
DROP COLUMN "region_code",
DROP COLUMN "region_name",
DROP COLUMN "updated_at",
DROP COLUMN "valid_from",
DROP COLUMN "valid_to",
ADD COLUMN     "basePrice" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "laborCost" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "machineCost" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "materialCost" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "overheadCost" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "profitCost" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "regionCode" VARCHAR(10) NOT NULL,
ADD COLUMN     "regionName" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validTo" TIMESTAMP(3),
ALTER COLUMN "chapter" SET DATA TYPE TEXT,
ALTER COLUMN "section" SET DATA TYPE TEXT,
ALTER COLUMN "subsection" SET DATA TYPE TEXT,
ALTER COLUMN "version" SET DATA TYPE TEXT,
ALTER COLUMN "source" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "tsn_items" DROP COLUMN "application_area",
DROP COLUMN "approval_date",
DROP COLUMN "approved_by",
DROP COLUMN "calculation_base",
DROP COLUMN "created_at",
DROP COLUMN "document_number",
DROP COLUMN "is_active",
DROP COLUMN "normative_type",
DROP COLUMN "region_code",
DROP COLUMN "region_name",
DROP COLUMN "updated_at",
DROP COLUMN "valid_from",
DROP COLUMN "valid_to",
ADD COLUMN     "applicationArea" TEXT,
ADD COLUMN     "approvalDate" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "calculationBase" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "documentNumber" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "normativeType" VARCHAR(50) NOT NULL,
ADD COLUMN     "regionCode" VARCHAR(10) NOT NULL,
ADD COLUMN     "regionName" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validTo" TIMESTAMP(3),
ALTER COLUMN "coefficient" SET NOT NULL,
ALTER COLUMN "coefficient" DROP DEFAULT,
ALTER COLUMN "version" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "tssc_items" DROP COLUMN "base_price",
DROP COLUMN "created_at",
DROP COLUMN "delivery_conditions",
DROP COLUMN "gost_tu",
DROP COLUMN "is_active",
DROP COLUMN "local_manufacturer",
DROP COLUMN "material_group",
DROP COLUMN "material_type",
DROP COLUMN "price_without_vat",
DROP COLUMN "region_code",
DROP COLUMN "region_name",
DROP COLUMN "storage_cost",
DROP COLUMN "transportation_cost",
DROP COLUMN "updated_at",
DROP COLUMN "valid_from",
DROP COLUMN "valid_to",
ADD COLUMN     "basePrice" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deliveryConditions" TEXT,
ADD COLUMN     "gstTu" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "localManufacturer" TEXT,
ADD COLUMN     "materialGroup" TEXT,
ADD COLUMN     "materialType" TEXT,
ADD COLUMN     "priceWithoutVAT" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "regionCode" VARCHAR(10) NOT NULL,
ADD COLUMN     "regionName" TEXT NOT NULL,
ADD COLUMN     "storageCost" DECIMAL(12,2),
ADD COLUMN     "transportationCost" DECIMAL(12,2),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validTo" TIMESTAMP(3),
ALTER COLUMN "version" SET DATA TYPE TEXT,
ALTER COLUMN "source" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "construction_resources" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "unit" VARCHAR(50) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_zones" (
    "id" TEXT NOT NULL,
    "regionCode" VARCHAR(10) NOT NULL,
    "regionName" TEXT NOT NULL,
    "zoneCode" VARCHAR(10) NOT NULL,
    "zoneName" TEXT NOT NULL,
    "coefficient" DECIMAL(6,3) NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labor_costs" (
    "id" TEXT NOT NULL,
    "regionCode" VARCHAR(10) NOT NULL,
    "regionName" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "costPerHour" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "labor_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_bases" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "unit" VARCHAR(50) NOT NULL,
    "basePrice" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_bases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gesn" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "unit" VARCHAR(50) NOT NULL,
    "laborHours" DECIMAL(10,3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gesn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "unit" VARCHAR(50) NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machines" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "hourlyRate" DECIMAL(12,2) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_groups" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" TEXT NOT NULL,
    "parentCode" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tech_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "construction_resources_code_key" ON "construction_resources"("code");

-- CreateIndex
CREATE UNIQUE INDEX "price_zones_regionCode_zoneCode_key" ON "price_zones"("regionCode", "zoneCode");

-- CreateIndex
CREATE UNIQUE INDEX "labor_costs_regionCode_year_month_category_key" ON "labor_costs"("regionCode", "year", "month", "category");

-- CreateIndex
CREATE UNIQUE INDEX "price_bases_code_key" ON "price_bases"("code");

-- CreateIndex
CREATE UNIQUE INDEX "gesn_code_key" ON "gesn"("code");

-- CreateIndex
CREATE UNIQUE INDEX "materials_code_key" ON "materials"("code");

-- CreateIndex
CREATE UNIQUE INDEX "machines_code_key" ON "machines"("code");

-- CreateIndex
CREATE UNIQUE INDEX "tech_groups_code_key" ON "tech_groups"("code");

-- CreateIndex
CREATE UNIQUE INDEX "fer_items_code_validFrom_key" ON "fer_items"("code", "validFrom");

-- CreateIndex
CREATE UNIQUE INDEX "fssc_items_code_validFrom_key" ON "fssc_items"("code", "validFrom");

-- CreateIndex
CREATE UNIQUE INDEX "gesn_items_code_regionCode_validFrom_key" ON "gesn_items"("code", "regionCode", "validFrom");

-- CreateIndex
CREATE UNIQUE INDEX "index_coefficients_coefficientType_basePeriod_targetPeriod__key" ON "index_coefficients"("coefficientType", "basePeriod", "targetPeriod", "regionCode", "constructionType");

-- CreateIndex
CREATE UNIQUE INDEX "ter_items_code_regionCode_validFrom_key" ON "ter_items"("code", "regionCode", "validFrom");

-- CreateIndex
CREATE UNIQUE INDEX "tsn_items_code_regionCode_validFrom_key" ON "tsn_items"("code", "regionCode", "validFrom");

-- CreateIndex
CREATE UNIQUE INDEX "tssc_items_code_regionCode_validFrom_key" ON "tssc_items"("code", "regionCode", "validFrom");

-- AddForeignKey
ALTER TABLE "gesn_materials" ADD CONSTRAINT "gesn_materials_gesnItemId_fkey" FOREIGN KEY ("gesnItemId") REFERENCES "gesn_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
