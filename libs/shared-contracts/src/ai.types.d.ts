import { Priority } from './project.types';
import { ProjectLocation } from './project.types';
export interface AIAnalysisRequest {
    id?: string;
    projectId: string;
    analysisType: AnalysisType;
    inputData: AnalysisInputData;
    priority: Priority;
    requestedBy: string;
    configuration?: AnalysisConfiguration;
    createdAt?: Date;
}
export interface AIAnalysisResult {
    id: string;
    requestId: string;
    projectId: string;
    analysisType: AnalysisType;
    results: AnalysisResultData;
    confidence: number;
    recommendations: Recommendation[];
    metadata: AnalysisMetadata;
    timestamp: Date;
    status: AnalysisStatus;
}
export declare enum AnalysisType {
    STRUCTURAL_ANALYSIS = "structural_analysis",
    COST_ESTIMATION = "cost_estimation",
    RISK_ASSESSMENT = "risk_assessment",
    TIMELINE_OPTIMIZATION = "timeline_optimization",
    QUALITY_INSPECTION = "quality_inspection",
    COMPLIANCE_CHECK = "compliance_check",
    RESOURCE_PLANNING = "resource_planning",
    ENVIRONMENTAL_IMPACT = "environmental_impact",
    SAFETY_ANALYSIS = "safety_analysis",
    DESIGN_OPTIMIZATION = "design_optimization"
}
export declare enum AnalysisStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export interface AnalysisInputData {
    documents?: string[];
    images?: string[];
    parameters?: Record<string, any>;
    contextData?: ProjectContext;
}
export interface ProjectContext {
    location: ProjectLocation;
    buildingType: BuildingType;
    materials: Material[];
    regulations: Regulation[];
    environmentalFactors: EnvironmentalFactor[];
}
export declare enum BuildingType {
    RESIDENTIAL = "residential",
    COMMERCIAL = "commercial",
    INDUSTRIAL = "industrial",
    INFRASTRUCTURE = "infrastructure",
    HEALTHCARE = "healthcare",
    EDUCATIONAL = "educational",
    MIXED_USE = "mixed_use"
}
export interface Material {
    id: string;
    name: string;
    type: MaterialType;
    properties: MaterialProperties;
    cost: MaterialCost;
    availability: MaterialAvailability;
}
export declare enum MaterialType {
    CONCRETE = "concrete",
    STEEL = "steel",
    WOOD = "wood",
    BRICK = "brick",
    GLASS = "glass",
    INSULATION = "insulation",
    ROOFING = "roofing",
    ELECTRICAL = "electrical",
    PLUMBING = "plumbing",
    HVAC = "hvac"
}
export interface MaterialProperties {
    strength?: number;
    density?: number;
    thermalConductivity?: number;
    durability?: number;
    sustainability?: SustainabilityRating;
}
export declare enum SustainabilityRating {
    POOR = "poor",
    FAIR = "fair",
    GOOD = "good",
    EXCELLENT = "excellent"
}
export interface MaterialCost {
    unitPrice: number;
    currency: string;
    unit: string;
    supplier?: string;
    lastUpdated: Date;
}
export interface MaterialAvailability {
    inStock: boolean;
    leadTime: number;
    minimumOrder?: number;
    supplier: string;
}
export interface Regulation {
    id: string;
    name: string;
    jurisdiction: string;
    category: RegulationCategory;
    requirements: string[];
    lastUpdated: Date;
}
export declare enum RegulationCategory {
    BUILDING_CODE = "building_code",
    SAFETY = "safety",
    ENVIRONMENTAL = "environmental",
    ACCESSIBILITY = "accessibility",
    FIRE_SAFETY = "fire_safety",
    STRUCTURAL = "structural",
    ELECTRICAL = "electrical",
    PLUMBING = "plumbing"
}
export interface EnvironmentalFactor {
    type: EnvironmentalType;
    value: number;
    unit: string;
    impact: ImpactLevel;
}
export declare enum EnvironmentalType {
    TEMPERATURE = "temperature",
    HUMIDITY = "humidity",
    WIND_SPEED = "wind_speed",
    RAINFALL = "rainfall",
    SEISMIC_ACTIVITY = "seismic_activity",
    SOIL_TYPE = "soil_type",
    GROUNDWATER_LEVEL = "groundwater_level"
}
export declare enum ImpactLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export interface AnalysisConfiguration {
    modelVersion?: string;
    parameters?: Record<string, any>;
    outputFormat?: OutputFormat;
    includeVisualization?: boolean;
    language?: string;
}
export declare enum OutputFormat {
    JSON = "json",
    PDF = "pdf",
    HTML = "html",
    XML = "xml"
}
export interface AnalysisResultData {
    summary: string;
    details: Record<string, any>;
    metrics: AnalysisMetric[];
    visualizations?: Visualization[];
    rawData?: any;
}
export interface AnalysisMetric {
    name: string;
    value: number;
    unit: string;
    category: string;
    description?: string;
}
export interface Visualization {
    type: VisualizationType;
    title: string;
    description?: string;
    data: any;
    config?: Record<string, any>;
}
export declare enum VisualizationType {
    CHART = "chart",
    DIAGRAM = "diagram",
    HEATMAP = "heatmap",
    THREE_D_MODEL = "3d_model",
    FLOOR_PLAN = "floor_plan",
    TIMELINE = "timeline"
}
export interface Recommendation {
    id: string;
    type: RecommendationType;
    title: string;
    description: string;
    priority: Priority;
    impact: ImpactLevel;
    implementationCost?: number;
    estimatedSavings?: number;
    timeline?: number;
    dependencies?: string[];
    category: RecommendationCategory;
}
export declare enum RecommendationType {
    OPTIMIZATION = "optimization",
    RISK_MITIGATION = "risk_mitigation",
    COST_REDUCTION = "cost_reduction",
    QUALITY_IMPROVEMENT = "quality_improvement",
    TIMELINE_ACCELERATION = "timeline_acceleration",
    COMPLIANCE = "compliance",
    SUSTAINABILITY = "sustainability"
}
export declare enum RecommendationCategory {
    DESIGN = "design",
    MATERIALS = "materials",
    CONSTRUCTION = "construction",
    MANAGEMENT = "management",
    SAFETY = "safety",
    QUALITY = "quality",
    COST = "cost",
    TIMELINE = "timeline"
}
export interface AnalysisMetadata {
    processingTime: number;
    modelVersion: string;
    dataSourcesUsed: string[];
    confidence: number;
    limitations?: string[];
    assumptions?: string[];
}
//# sourceMappingURL=ai.types.d.ts.map