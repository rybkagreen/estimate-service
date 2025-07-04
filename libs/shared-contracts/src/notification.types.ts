// Notification system types and enums

export enum ChannelType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  WEBHOOK = 'WEBHOOK',
  SLACK = 'SLACK',
  TELEGRAM = 'TELEGRAM'
}

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  ALERT = 'ALERT'
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  READ = 'READ'
}

export enum DeliveryStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
  REJECTED = 'REJECTED'
}

// Notification interfaces
export interface NotificationChannel {
  id: string;
  name: string;
  type: ChannelType;
  isActive: boolean;
  configuration: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationMessage {
  id: string;
  title: string;
  content: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  recipientId: string;
  channelId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject?: string;
  content: string;
  type: NotificationType;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSubscription {
  id: string;
  userId: string;
  channelId: string;
  isActive: boolean;
  preferences: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Request/Response DTOs
export interface CreateNotificationRequest {
  title: string;
  content: string;
  type: NotificationType;
  priority: NotificationPriority;
  recipientId: string;
  channelId?: string;
  metadata?: Record<string, any>;
}

export interface NotificationResponse {
  id: string;
  title: string;
  content: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  recipientId: string;
  channelId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
}

export interface UpdateNotificationDto {
  title?: string;
  content?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
}

export interface NotificationQueryDto {
  type?: NotificationType;
  priority?: NotificationPriority;
  status?: NotificationStatus;
  recipientId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
