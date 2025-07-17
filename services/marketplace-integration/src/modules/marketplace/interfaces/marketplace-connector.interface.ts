/**
 * Интерфейс для коннекторов маркетплейсов
 */

export interface MarketplaceConnector {
  /**
   * Уникальный идентификатор маркетплейса
   */
  readonly marketplaceId: string;

  /**
   * Название маркетплейса
   */
  readonly name: string;

  /**
   * Проверка доступности маркетплейса
   */
  healthCheck(): Promise<HealthCheckResult>;

  /**
   * Поиск товаров/услуг
   */
  searchProducts(query: ProductSearchQuery): Promise<ProductSearchResult>;

  /**
   * Получение детальной информации о товаре
   */
  getProductDetails(productId: string): Promise<ProductDetails | null>;

  /**
   * Получение актуальной цены
   */
  getCurrentPrice(productId: string): Promise<PriceInfo | null>;

  /**
   * Проверка доступности
   */
  checkAvailability(productId: string, quantity: number): Promise<AvailabilityInfo>;

  /**
   * Получение истории цен
   */
  getPriceHistory(productId: string, period: PricePeriod): Promise<PriceHistory[]>;

  /**
   * Расчет стоимости доставки
   */
  calculateDelivery(params: DeliveryCalculationParams): Promise<DeliveryInfo>;

  /**
   * Создание заказа
   */
  createOrder(order: OrderCreateRequest): Promise<OrderCreateResponse>;

  /**
   * Получение статуса заказа
   */
  getOrderStatus(orderId: string): Promise<OrderStatus>;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  message?: string;
}

export interface ProductSearchQuery {
  query: string;
  category?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ProductSearchResult {
  products: MarketplaceProduct[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface MarketplaceProduct {
  id: string;
  externalId: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  price: number;
  currency: string;
  available: boolean;
  supplier: SupplierInfo;
  images?: string[];
  specifications?: Record<string, any>;
}

export interface ProductDetails extends MarketplaceProduct {
  fullDescription?: string;
  technicalSpecs?: Record<string, string>;
  certifications?: string[];
  warranty?: string;
  deliveryOptions?: DeliveryOption[];
  relatedProducts?: string[];
}

export interface PriceInfo {
  productId: string;
  basePrice: number;
  currentPrice: number;
  currency: string;
  discounts?: DiscountInfo[];
  bulkPricing?: BulkPricing[];
  validUntil?: Date;
  includesVAT: boolean;
}

export interface DiscountInfo {
  type: 'percentage' | 'fixed';
  value: number;
  description?: string;
  conditions?: string;
}

export interface BulkPricing {
  minQuantity: number;
  maxQuantity?: number;
  pricePerUnit: number;
}

export interface AvailabilityInfo {
  productId: string;
  inStock: boolean;
  quantity: number;
  leadTime?: number; // days
  warehouseLocation?: string;
  reservationAvailable: boolean;
}

export interface PricePeriod {
  startDate: Date;
  endDate: Date;
}

export interface PriceHistory {
  date: Date;
  price: number;
  currency: string;
  event?: string; // promotion, price change, etc.
}

export interface DeliveryCalculationParams {
  productIds: string[];
  quantities: number[];
  destinationAddress: Address;
  deliveryType?: 'standard' | 'express' | 'scheduled';
}

export interface Address {
  region: string;
  city: string;
  street?: string;
  postalCode?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
}

export interface DeliveryInfo {
  cost: number;
  currency: string;
  estimatedDays: number;
  carrier?: string;
  restrictions?: string[];
}

export interface DeliveryOption {
  type: 'standard' | 'express' | 'scheduled';
  cost: number;
  estimatedDays: number;
  carrier: string;
}

export interface SupplierInfo {
  id: string;
  name: string;
  rating?: number;
  location?: string;
  verified: boolean;
}

export interface OrderCreateRequest {
  items: OrderItem[];
  deliveryAddress: Address;
  deliveryType: 'standard' | 'express' | 'scheduled';
  customerInfo: CustomerInfo;
  paymentMethod?: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  pricePerUnit: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  inn?: string;
}

export interface OrderCreateResponse {
  orderId: string;
  externalOrderId: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  estimatedDelivery: Date;
  paymentInstructions?: string;
}

export interface OrderStatus {
  orderId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  statusDate: Date;
  trackingNumber?: string;
  statusDetails?: string;
}
