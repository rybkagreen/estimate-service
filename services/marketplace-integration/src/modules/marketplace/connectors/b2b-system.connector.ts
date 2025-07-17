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
 * Коннектор для маркетплейса B2B-System
 * Специализируется на оптовых поставках строительных материалов
 */
export class B2BSystemConnector extends BaseConnector {
  readonly marketplaceId = 'b2b-system';
  readonly name = 'B2B-System';

  async searchProducts(query: ProductSearchQuery): Promise<ProductSearchResult> {
    const cacheKey = `${this.marketplaceId}:search:${JSON.stringify(query)}`;
    const cached = await this.getCached<ProductSearchResult>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<B2BSearchResponse>(
        'post',
        '/search/products',
        {
          text: query.query,
          filters: {
            category_id: query.category,
            region_id: query.region,
            price_min: query.minPrice,
            price_max: query.maxPrice,
            only_available: query.inStock,
          },
          pagination: {
            page: query.page || 1,
            size: query.pageSize || 20,
          },
        }
      );

      const result: ProductSearchResult = {
        products: response.data.products.map(item => this.mapToProduct(item)),
        totalCount: response.data.total_count,
        page: response.data.current_page,
        pageSize: response.data.page_size,
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
      const response = await this.makeRequest<B2BProductResponse>(
        'get',
        `/products/${productId}/full`
      );

      const details = this.mapToProductDetails(response.data);
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
      const response = await this.makeRequest<B2BPriceResponse>(
        'get',
        `/products/${productId}/pricing`
      );

      const priceInfo: PriceInfo = {
        productId,
        basePrice: response.data.base_price,
        currentPrice: response.data.actual_price,
        currency: 'RUB',
        discounts: response.data.discounts?.map(d => ({
          type: d.discount_type === 'percent' ? 'percentage' : 'fixed',
          value: d.discount_value,
          description: d.description,
          conditions: d.conditions,
        })),
        bulkPricing: response.data.volume_prices?.map(vp => ({
          minQuantity: vp.from_quantity,
          maxQuantity: vp.to_quantity,
          pricePerUnit: vp.unit_price,
        })),
        validUntil: response.data.price_valid_until ? new Date(response.data.price_valid_until) : undefined,
        includesVAT: response.data.vat_included,
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
      const response = await this.makeRequest<B2BAvailabilityResponse>(
        'post',
        `/products/${productId}/check-availability`,
        { required_quantity: quantity }
      );

      return {
        productId,
        inStock: response.data.available,
        quantity: response.data.stock_quantity,
        leadTime: response.data.delivery_days,
        warehouseLocation: response.data.warehouse_name,
        reservationAvailable: response.data.can_reserve,
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
      const response = await this.makeRequest<B2BPriceHistoryResponse>(
        'get',
        `/products/${productId}/price-history`,
        {
          params: {
            date_from: period.startDate.toISOString().split('T')[0],
            date_to: period.endDate.toISOString().split('T')[0],
          },
        }
      );

      const history: PriceHistory[] = response.data.history.map(h => ({
        date: new Date(h.date),
        price: h.price,
        currency: 'RUB',
        event: h.change_reason,
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
      const response = await this.makeRequest<B2BDeliveryResponse>(
        'post',
        '/delivery/calculate',
        {
          items: params.productIds.map((id, index) => ({
            product_id: id,
            quantity: params.quantities[index],
          })),
          delivery_address: {
            region: params.destinationAddress.region,
            city: params.destinationAddress.city,
            postal_code: params.destinationAddress.postalCode,
            coordinates: params.destinationAddress.coordinates,
          },
          delivery_type: this.mapDeliveryType(params.deliveryType),
        }
      );

      return {
        cost: response.data.total_cost,
        currency: 'RUB',
        estimatedDays: response.data.delivery_days,
        carrier: response.data.transport_company,
        restrictions: response.data.limitations || [],
      };
    } catch (error) {
      this.logger.error(`Calculate delivery error: ${error}`);
      throw error;
    }
  }

  async createOrder(order: OrderCreateRequest): Promise<OrderCreateResponse> {
    try {
      const response = await this.makeRequest<B2BOrderResponse>(
        'post',
        '/orders/create',
        {
          products: order.items.map(item => ({
            product_id: item.productId,
            quantity: item.quantity,
            agreed_price: item.pricePerUnit,
          })),
          delivery: {
            address: {
              region: order.deliveryAddress.region,
              city: order.deliveryAddress.city,
              street: order.deliveryAddress.street,
              postal_code: order.deliveryAddress.postalCode,
            },
            type: this.mapDeliveryType(order.deliveryType),
          },
          buyer: {
            contact_name: order.customerInfo.name,
            email: order.customerInfo.email,
            phone: order.customerInfo.phone,
            company_name: order.customerInfo.companyName,
            inn: order.customerInfo.inn,
          },
          payment_type: order.paymentMethod || 'invoice',
          comment: order.notes,
        }
      );

      return {
        orderId: response.data.order_id,
        externalOrderId: response.data.external_order_id,
        status: {
          orderId: response.data.order_id,
          status: this.mapOrderStatus(response.data.status),
          statusDate: new Date(response.data.created_at),
        },
        totalAmount: response.data.total_sum,
        currency: 'RUB',
        estimatedDelivery: new Date(response.data.expected_delivery_date),
        paymentInstructions: response.data.payment_details,
      };
    } catch (error) {
      this.logger.error(`Create order error: ${error}`);
      throw error;
    }
  }

  async getOrderStatus(orderId: string): Promise<OrderStatus> {
    try {
      const response = await this.makeRequest<B2BOrderStatusResponse>(
        'get',
        `/orders/${orderId}/status`
      );

      return {
        orderId,
        status: this.mapOrderStatus(response.data.status),
        statusDate: new Date(response.data.last_updated),
        trackingNumber: response.data.tracking_code,
        statusDetails: response.data.status_description,
      };
    } catch (error) {
      this.logger.error(`Get order status error: ${error}`);
      throw error;
    }
  }

  private mapToProduct(item: any): MarketplaceProduct {
    return {
      id: `${this.marketplaceId}:${item.product_id}`,
      externalId: item.product_id,
      name: item.product_name,
      description: item.description,
      category: item.category,
      unit: item.unit_type,
      price: item.price,
      currency: 'RUB',
      available: item.is_available,
      supplier: {
        id: item.supplier_id,
        name: item.supplier_name,
        rating: item.supplier_rating,
        location: item.supplier_city,
        verified: item.supplier_verified,
      },
      images: item.photos || [],
      specifications: item.properties || {},
    };
  }

  private mapToProductDetails(product: any): ProductDetails {
    return {
      ...this.mapToProduct(product),
      fullDescription: product.detailed_description,
      technicalSpecs: product.technical_properties,
      certifications: product.certificates || [],
      warranty: product.warranty_info,
      deliveryOptions: product.delivery_methods?.map((dm: any) => ({
        type: this.reverseMapDeliveryType(dm.type),
        cost: dm.price,
        estimatedDays: dm.days,
        carrier: dm.carrier_name,
      })),
      relatedProducts: product.similar_products || [],
    };
  }

  private mapOrderStatus(status: string): OrderStatus['status'] {
    const statusMap: Record<string, OrderStatus['status']> = {
      'created': 'pending',
      'waiting_payment': 'pending',
      'paid': 'confirmed',
      'in_work': 'processing',
      'sent': 'shipped',
      'completed': 'delivered',
      'cancelled': 'cancelled',
    };

    return statusMap[status] || 'pending';
  }

  private mapDeliveryType(type?: string): string {
    const typeMap: Record<string, string> = {
      'standard': 'regular',
      'express': 'fast',
      'scheduled': 'planned',
    };

    return typeMap[type || 'standard'] || 'regular';
  }

  private reverseMapDeliveryType(type: string): 'standard' | 'express' | 'scheduled' {
    const typeMap: Record<string, 'standard' | 'express' | 'scheduled'> = {
      'regular': 'standard',
      'fast': 'express',
      'planned': 'scheduled',
    };

    return typeMap[type] || 'standard';
  }
}

// Response interfaces for B2B-System API
interface B2BSearchResponse {
  data: {
    products: any[];
    total_count: number;
    current_page: number;
    page_size: number;
  };
}

interface B2BProductResponse {
  data: any;
}

interface B2BPriceResponse {
  data: {
    base_price: number;
    actual_price: number;
    vat_included: boolean;
    price_valid_until?: string;
    discounts?: Array<{
      discount_type: string;
      discount_value: number;
      description?: string;
      conditions?: string;
    }>;
    volume_prices?: Array<{
      from_quantity: number;
      to_quantity?: number;
      unit_price: number;
    }>;
  };
}

interface B2BAvailabilityResponse {
  data: {
    available: boolean;
    stock_quantity: number;
    delivery_days?: number;
    warehouse_name?: string;
    can_reserve: boolean;
  };
}

interface B2BPriceHistoryResponse {
  data: {
    history: Array<{
      date: string;
      price: number;
      change_reason?: string;
    }>;
  };
}

interface B2BDeliveryResponse {
  data: {
    total_cost: number;
    delivery_days: number;
    transport_company: string;
    limitations?: string[];
  };
}

interface B2BOrderResponse {
  data: {
    order_id: string;
    external_order_id: string;
    status: string;
    created_at: string;
    total_sum: number;
    expected_delivery_date: string;
    payment_details?: string;
  };
}

interface B2BOrderStatusResponse {
  data: {
    status: string;
    last_updated: string;
    tracking_code?: string;
    status_description?: string;
  };
}
