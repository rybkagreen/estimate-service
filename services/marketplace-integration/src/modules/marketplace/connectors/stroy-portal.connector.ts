import { BaseConnector } from './base.connector';
import {
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
  OrderStatus,
  MarketplaceProduct,
} from '../interfaces/marketplace-connector.interface';

/**
 * Коннектор для маркетплейса StroyPortal
 * Один из крупнейших B2B маркетплейсов строительных материалов в России
 */
export class StroyPortalConnector extends BaseConnector {
  readonly marketplaceId = 'stroy-portal';
  readonly name = 'СтройПортал';

  async searchProducts(query: ProductSearchQuery): Promise<ProductSearchResult> {
    const cacheKey = `${this.marketplaceId}:search:${JSON.stringify(query)}`;
    const cached = await this.getCached<ProductSearchResult>(cacheKey);
    if (cached) return cached;

    try {
      const params = this.buildSearchParams(query);
      const response = await this.makeRequest<StroyPortalSearchResponse>(
        'get',
        '/api/v2/products/search',
        { params }
      );

      const result: ProductSearchResult = {
        products: response.items.map(item => this.mapToProduct(item)),
        totalCount: response.total,
        page: query.page || 1,
        pageSize: query.pageSize || 20,
      };

      await this.setCached(cacheKey, result, 300); // 5 minutes
      return result;
    } catch (error) {
      this.logger.error(`Search products error: ${error}`);
      throw error;
    }
  }

  async getProductDetails(productId: string): Promise<ProductDetails | null> {
    const cacheKey = `${this.marketplaceId}:product:${productId}`;
    const cached = await this.getCached<ProductDetails>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<StroyPortalProduct>(
        'get',
        `/api/v2/products/${productId}`
      );

      const details = this.mapToProductDetails(response);
      await this.setCached(cacheKey, details, 600); // 10 minutes
      return details;
    } catch (error) {
      this.logger.error(`Get product details error: ${error}`);
      return null;
    }
  }

  async getCurrentPrice(productId: string): Promise<PriceInfo | null> {
    const cacheKey = `${this.marketplaceId}:price:${productId}`;
    const cached = await this.getCached<PriceInfo>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<StroyPortalPriceResponse>(
        'get',
        `/api/v2/products/${productId}/price`
      );

      const priceInfo: PriceInfo = {
        productId,
        basePrice: response.base_price,
        currentPrice: response.current_price,
        currency: response.currency,
        discounts: response.discounts?.map(d => ({
          type: d.type as 'percentage' | 'fixed',
          value: d.value,
          description: d.description,
        })),
        bulkPricing: response.bulk_pricing?.map(bp => ({
          minQuantity: bp.min_quantity,
          maxQuantity: bp.max_quantity,
          pricePerUnit: bp.price_per_unit,
        })),
        validUntil: response.valid_until ? new Date(response.valid_until) : undefined,
        includesVAT: response.includes_vat,
      };

      await this.setCached(cacheKey, priceInfo, 60); // 1 minute
      return priceInfo;
    } catch (error) {
      this.logger.error(`Get current price error: ${error}`);
      return null;
    }
  }

  async checkAvailability(productId: string, quantity: number): Promise<AvailabilityInfo> {
    try {
      const response = await this.makeRequest<StroyPortalAvailabilityResponse>(
        'get',
        `/api/v2/products/${productId}/availability`,
        { params: { quantity } }
      );

      return {
        productId,
        inStock: response.in_stock,
        quantity: response.available_quantity,
        leadTime: response.lead_time_days,
        warehouseLocation: response.warehouse_location,
        reservationAvailable: response.can_reserve,
      };
    } catch (error) {
      this.logger.error(`Check availability error: ${error}`);
      return {
        productId,
        inStock: false,
        quantity: 0,
        reservationAvailable: false,
      };
    }
  }

  async getPriceHistory(productId: string, period: PricePeriod): Promise<PriceHistory[]> {
    const cacheKey = `${this.marketplaceId}:history:${productId}:${period.startDate.toISOString()}:${period.endDate.toISOString()}`;
    const cached = await this.getCached<PriceHistory[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<StroyPortalPriceHistoryResponse>(
        'get',
        `/api/v2/products/${productId}/price-history`,
        {
          params: {
            start_date: period.startDate.toISOString(),
            end_date: period.endDate.toISOString(),
          },
        }
      );

      const history: PriceHistory[] = response.history.map(h => ({
        date: new Date(h.date),
        price: h.price,
        currency: h.currency,
        event: h.event,
      }));

      await this.setCached(cacheKey, history, 3600); // 1 hour
      return history;
    } catch (error) {
      this.logger.error(`Get price history error: ${error}`);
      return [];
    }
  }

  async calculateDelivery(params: DeliveryCalculationParams): Promise<DeliveryInfo> {
    try {
      const response = await this.makeRequest<StroyPortalDeliveryResponse>(
        'post',
        '/api/v2/delivery/calculate',
        {
          products: params.productIds.map((id, index) => ({
            product_id: id,
            quantity: params.quantities[index],
          })),
          destination: {
            region: params.destinationAddress.region,
            city: params.destinationAddress.city,
            postal_code: params.destinationAddress.postalCode,
          },
          delivery_type: params.deliveryType,
        }
      );

      return {
        cost: response.total_cost,
        currency: response.currency,
        estimatedDays: response.estimated_days,
        carrier: response.carrier,
        restrictions: response.restrictions,
      };
    } catch (error) {
      this.logger.error(`Calculate delivery error: ${error}`);
      throw error;
    }
  }

  async createOrder(order: OrderCreateRequest): Promise<OrderCreateResponse> {
    try {
      const response = await this.makeRequest<StroyPortalOrderResponse>(
        'post',
        '/api/v2/orders',
        {
          items: order.items.map(item => ({
            product_id: item.productId,
            quantity: item.quantity,
            price: item.pricePerUnit,
          })),
          delivery_address: {
            region: order.deliveryAddress.region,
            city: order.deliveryAddress.city,
            street: order.deliveryAddress.street,
            postal_code: order.deliveryAddress.postalCode,
          },
          delivery_type: order.deliveryType,
          customer: {
            name: order.customerInfo.name,
            email: order.customerInfo.email,
            phone: order.customerInfo.phone,
            company: order.customerInfo.companyName,
            inn: order.customerInfo.inn,
          },
          payment_method: order.paymentMethod,
          notes: order.notes,
        }
      );

      return {
        orderId: response.id,
        externalOrderId: response.external_id,
        status: {
          orderId: response.id,
          status: this.mapOrderStatus(response.status),
          statusDate: new Date(response.created_at),
        },
        totalAmount: response.total_amount,
        currency: response.currency,
        estimatedDelivery: new Date(response.estimated_delivery),
        paymentInstructions: response.payment_instructions,
      };
    } catch (error) {
      this.logger.error(`Create order error: ${error}`);
      throw error;
    }
  }

  async getOrderStatus(orderId: string): Promise<OrderStatus> {
    try {
      const response = await this.makeRequest<StroyPortalOrderStatusResponse>(
        'get',
        `/api/v2/orders/${orderId}/status`
      );

      return {
        orderId,
        status: this.mapOrderStatus(response.status),
        statusDate: new Date(response.updated_at),
        trackingNumber: response.tracking_number,
        statusDetails: response.status_details,
      };
    } catch (error) {
      this.logger.error(`Get order status error: ${error}`);
      throw error;
    }
  }

  private buildSearchParams(query: ProductSearchQuery): Record<string, any> {
    const params: Record<string, any> = {
      q: query.query,
      page: query.page || 1,
      per_page: query.pageSize || 20,
    };

    if (query.category) params.category = query.category;
    if (query.region) params.region = query.region;
    if (query.minPrice !== undefined) params.min_price = query.minPrice;
    if (query.maxPrice !== undefined) params.max_price = query.maxPrice;
    if (query.inStock !== undefined) params.in_stock = query.inStock;

    return params;
  }

  private mapToProduct(item: any): MarketplaceProduct {
    return {
      id: `${this.marketplaceId}:${item.id}`,
      externalId: item.id,
      name: item.name,
      description: item.short_description,
      category: item.category_name,
      unit: item.unit,
      price: item.price,
      currency: item.currency || 'RUB',
      available: item.in_stock,
      supplier: {
        id: item.supplier_id,
        name: item.supplier_name,
        rating: item.supplier_rating,
        location: item.supplier_location,
        verified: item.supplier_verified,
      },
      images: item.images || [],
      specifications: item.specifications || {},
    };
  }

  private mapToProductDetails(product: any): ProductDetails {
    return {
      ...this.mapToProduct(product),
      fullDescription: product.full_description,
      technicalSpecs: product.technical_specifications,
      certifications: product.certifications || [],
      warranty: product.warranty,
      deliveryOptions: product.delivery_options?.map((opt: any) => ({
        type: opt.type,
        cost: opt.cost,
        estimatedDays: opt.estimated_days,
        carrier: opt.carrier,
      })),
      relatedProducts: product.related_products || [],
    };
  }

  private mapOrderStatus(status: string): OrderStatus['status'] {
    const statusMap: Record<string, OrderStatus['status']> = {
      'new': 'pending',
      'pending': 'pending',
      'confirmed': 'confirmed',
      'processing': 'processing',
      'shipped': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled',
      'canceled': 'cancelled',
    };

    return statusMap[status.toLowerCase()] || 'pending';
  }
}

// Response interfaces for StroyPortal API
interface StroyPortalSearchResponse {
  items: any[];
  total: number;
  page: number;
  per_page: number;
}

interface StroyPortalProduct {
  id: string;
  name: string;
  // ... other fields
}

interface StroyPortalPriceResponse {
  base_price: number;
  current_price: number;
  currency: string;
  includes_vat: boolean;
  valid_until?: string;
  discounts?: Array<{
    type: string;
    value: number;
    description?: string;
  }>;
  bulk_pricing?: Array<{
    min_quantity: number;
    max_quantity?: number;
    price_per_unit: number;
  }>;
}

interface StroyPortalAvailabilityResponse {
  in_stock: boolean;
  available_quantity: number;
  lead_time_days?: number;
  warehouse_location?: string;
  can_reserve: boolean;
}

interface StroyPortalPriceHistoryResponse {
  history: Array<{
    date: string;
    price: number;
    currency: string;
    event?: string;
  }>;
}

interface StroyPortalDeliveryResponse {
  total_cost: number;
  currency: string;
  estimated_days: number;
  carrier: string;
  restrictions?: string[];
}

interface StroyPortalOrderResponse {
  id: string;
  external_id: string;
  status: string;
  created_at: string;
  total_amount: number;
  currency: string;
  estimated_delivery: string;
  payment_instructions?: string;
}

interface StroyPortalOrderStatusResponse {
  status: string;
  updated_at: string;
  tracking_number?: string;
  status_details?: string;
}
