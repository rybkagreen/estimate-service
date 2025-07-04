// Construction Object Types
// Import DocumentType from document.types instead of defining it here
import { DocumentType } from './document.types';

export enum ConstructionObjectType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL', 
  INDUSTRIAL = 'INDUSTRIAL',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  SOCIAL = 'SOCIAL',
  MIXED_USE = 'MIXED_USE',
  TRANSPORTATION = 'TRANSPORTATION',
  ENERGY = 'ENERGY',
  OTHER = 'OTHER',
}

export enum ConstructionObjectStatus {
  PLANNING = 'PLANNING',
  DESIGN = 'DESIGN',
  EXPERTISE = 'EXPERTISE',
  APPROVAL = 'APPROVAL',
  PREPARATION = 'PREPARATION',
  CONSTRUCTION = 'CONSTRUCTION',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  INSPECTION = 'INSPECTION',
  COMMISSIONING = 'COMMISSIONING',
  COMMISSIONED = 'COMMISSIONED',
  COMPLETED = 'COMPLETED',
  MAINTENANCE = 'MAINTENANCE',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
}

// Construction Project Types
export interface ConstructionProject {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  location: ProjectLocation;
  timeline: ProjectTimeline;
  budget: ProjectBudget;
  stakeholders: ProjectStakeholder[];
  documents: ProjectDocument[];
  milestones: ProjectMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectStatus {
  PLANNING = 'planning',
  DESIGN = 'design',
  PERMITS = 'permits',
  CONSTRUCTION = 'construction',
  INSPECTION = 'inspection',
  COMPLETION = 'completion',
  MAINTENANCE = 'maintenance',
  CANCELLED = 'cancelled',
}

export interface ProjectLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface ProjectTimeline {
  startDate: Date;
  endDate: Date;
  estimatedDuration: number; // in days
  actualDuration?: number; // in days
  phases: ProjectPhase[];
}

export interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: PhaseStatus;
  dependencies: string[]; // phase IDs
  tasks: ProjectTask[];
}

export enum PhaseStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled',
}

export interface ProjectTask {
  id: string;
  name: string;
  description: string;
  assignedTo: string; // user ID
  status: TaskStatus;
  priority: Priority;
  startDate: Date;
  endDate: Date;
  completionPercentage: number;
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface ProjectBudget {
  totalBudget: number;
  spentAmount: number;
  remainingAmount: number;
  currency: string;
  budgetBreakdown: BudgetCategory[];
}

export interface BudgetCategory {
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  description?: string;
}

export interface ProjectStakeholder {
  userId: string;
  role: StakeholderRole;
  responsibilities: string[];
  accessLevel: AccessLevel;
}

export enum StakeholderRole {
  OWNER = 'owner',
  ARCHITECT = 'architect',
  CONTRACTOR = 'contractor',
  ENGINEER = 'engineer',
  SUPERVISOR = 'supervisor',
  INSPECTOR = 'inspector',
  CLIENT = 'client',
}

export enum AccessLevel {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin',
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  uploadedBy: string; // user ID
  uploadedAt: Date;
  version: string;
  size: number; // in bytes
  tags: string[];
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  actualDate?: Date;
  status: MilestoneStatus;
  criteria: string[];
}

export enum MilestoneStatus {
  PENDING = 'pending',
  ACHIEVED = 'achieved',
  MISSED = 'missed',
  CANCELLED = 'cancelled',
}

// Construction Object Interfaces
export interface ConstructionObject {
  id: string;
  name: string;
  description?: string;
  type: ConstructionObjectType;
  status: ConstructionObjectStatus;
  priority: Priority;
  
  // Geographic data
  address: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  city?: string;
  district?: string;
  
  // Project dates
  startDate?: Date;
  plannedEndDate?: Date;
  actualEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Financial data
  budgetPlanned?: number;
  budgetActual?: number;
  currency?: string;
  
  // Technical characteristics
  totalArea?: number;
  buildingArea?: number;
  floors?: number;
  height?: number;
  
  // Relationships
  ownerId: string;
  managerId?: string;
  contractorId?: string;
  
  // Metadata
  metadata?: any;
  tags?: string[];
}

// DTOs for Construction Objects
export interface CreateConstructionObjectDto {
  name: string;
  description?: string;
  type: ConstructionObjectType;
  status?: ConstructionObjectStatus;
  priority?: Priority;
  address: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  city?: string;
  district?: string;
  startDate?: string;
  plannedEndDate?: string;
  budgetPlanned?: number;
  currency?: string;
  totalArea?: number;
  buildingArea?: number;
  floors?: number;
  height?: number;
  ownerId: string;
  managerId?: string;
  contractorId?: string;
  tags?: string[];
  metadata?: any;
}

export interface UpdateConstructionObjectDto {
  name?: string;
  description?: string;
  type?: ConstructionObjectType;
  status?: ConstructionObjectStatus;
  priority?: Priority;
  address?: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  city?: string;
  district?: string;
  startDate?: string;
  plannedEndDate?: string;
  actualEndDate?: string;
  budgetPlanned?: number;
  budgetActual?: number;
  currency?: string;
  totalArea?: number;
  buildingArea?: number;
  floors?: number;
  height?: number;
  managerId?: string;
  contractorId?: string;
  tags?: string[];
  metadata?: any;
}

export interface ConstructionObjectQueryDto {
  type?: ConstructionObjectType;
  status?: ConstructionObjectStatus;
  priority?: Priority;
  ownerId?: string;
  managerId?: string;
  city?: string;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
