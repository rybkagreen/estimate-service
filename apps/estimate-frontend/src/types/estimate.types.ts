export interface Estimate {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: EstimateStatus;
  version: number;
  totalCost: number;
  laborCost: number;
  materialCost: number;
  equipmentCost: number;
  overheadCost: number;
  profitMargin: number;
  vatRate: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  tags: string[];
  attachments: Attachment[];
  metadata?: Record<string, any>;
}

export enum EstimateStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED'
}

export interface EstimateItem {
  id: string;
  estimateId: string;
  parentId?: string; // для группировки
  position: number;
  code: string;
  name: string;
  description?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  laborCost: number;
  materialCost: number;
  equipmentCost: number;
  overheadPercent: number;
  profitPercent: number;
  formula?: string;
  dependencies?: string[]; // IDs других позиций для формул
  isGroup: boolean;
  children?: EstimateItem[];
  metadata?: Record<string, any>;
}

export interface Material {
  id: string;
  code: string;
  name: string;
  description?: string;
  unit: string;
  basePrice: number;
  category: string;
  supplier?: string;
  lastUpdated: string;
  priceHistory: PricePoint[];
  specifications?: Record<string, any>;
}

export interface Work {
  id: string;
  code: string;
  name: string;
  description?: string;
  unit: string;
  laborHours: number;
  laborRate: number;
  category: string;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  requiredSkills: string[];
  materials?: MaterialRequirement[];
  equipment?: EquipmentRequirement[];
}

export interface MaterialRequirement {
  materialId: string;
  quantity: number;
  unit: string;
}

export interface EquipmentRequirement {
  equipmentId: string;
  hours: number;
  rate: number;
}

export interface EstimateTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  items: Partial<EstimateItem>[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  usageCount: number;
}

export interface PricePoint {
  date: string;
  price: number;
  source?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface EstimateFilter {
  status?: EstimateStatus[];
  projectId?: string;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
  minCost?: number;
  maxCost?: number;
  tags?: string[];
  search?: string;
}

export interface EstimateSortOptions {
  field: 'name' | 'totalCost' | 'createdAt' | 'updatedAt' | 'status';
  direction: 'asc' | 'desc';
}

export interface EstimateCalculationResult {
  subtotal: number;
  overhead: number;
  profit: number;
  totalBeforeVat: number;
  vat: number;
  grandTotal: number;
  breakdown: {
    labor: number;
    materials: number;
    equipment: number;
  };
}
