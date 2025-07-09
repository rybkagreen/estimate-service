export interface Estimate {
  id: string;
  title: string;
  description: string;
  totalCost: number;
  items: EstimateItem[];
  status: EstimateStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export enum EstimateStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface CreateEstimateDto {
  title: string;
  description: string;
  items: Omit<EstimateItem, 'id'>[];
}

export interface UpdateEstimateDto {
  title?: string;
  description?: string;
  items?: Omit<EstimateItem, 'id'>[];
  status?: EstimateStatus;
}

export class EstimateApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error?: unknown
  ) {
    super(message);
    this.name = 'EstimateApiError';
  }
}
