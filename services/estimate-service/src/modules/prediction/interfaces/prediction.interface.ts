export interface PredictionResult {
  estimatedCost: number;
  confidence: number;
  breakdown: CostBreakdown;
  metadata: {
    modelVersion: string;
    timestamp: Date;
    parameters: any;
  };
}

export interface CostBreakdown {
  materials: number;
  labor: number;
  equipment: number;
  overhead: number;
  contingency: number;
}

export interface RiskAnalysis {
  overallRiskScore: number;
  riskFactors: RiskFactor[];
  recommendations: string[];
  potentialOverspend: number;
}

export interface RiskFactor {
  name: string;
  severity: 'low' | 'medium' | 'high';
  impact: number;
  mitigation: string;
}

export interface BudgetOptimization {
  originalBudget: number;
  optimizedBudget: number;
  savings: number;
  optimizations: OptimizationItem[];
}

export interface OptimizationItem {
  category: string;
  originalCost: number;
  optimizedCost: number;
  description: string;
}
