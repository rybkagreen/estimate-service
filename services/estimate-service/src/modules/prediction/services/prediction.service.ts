import { Injectable, Logger } from '@nestjs/common';
import { PredictCostDto } from '../dto/predict-cost.dto';
import { HuggingFaceService } from './huggingface.service';
import {
  PredictionResult,
  RiskAnalysis,
  BudgetOptimization,
  CostBreakdown,
  RiskFactor,
} from '../interfaces/prediction.interface';

@Injectable()
export class PredictionService {
  private readonly logger = new Logger(PredictionService.name);
  
  constructor(private readonly huggingFaceService: HuggingFaceService) {}

  async predictCost(predictCostDto: PredictCostDto): Promise<PredictionResult> {
    try {
      // Extract features from project data
      const features = await this.huggingFaceService.extractFeatures(predictCostDto);
      
      // For demonstration, using a simple calculation
      // In production, you'd use a trained ML model via Hugging Face
      const baseCostPerSqm = 50000; // RUB per square meter
      const locationMultiplier = features[3]; // location factor
      const complexityFactor = 1 + (predictCostDto.floors - 1) * 0.15;
      
      const estimatedCost = predictCostDto.area * baseCostPerSqm * locationMultiplier * complexityFactor;
      
      const breakdown: CostBreakdown = {
        materials: estimatedCost * 0.4,
        labor: estimatedCost * 0.3,
        equipment: estimatedCost * 0.1,
        overhead: estimatedCost * 0.15,
        contingency: estimatedCost * 0.05,
      };
      
      return {
        estimatedCost,
        confidence: 0.85,
        breakdown,
        metadata: {
          modelVersion: '1.0.0',
          timestamp: new Date(),
          parameters: predictCostDto,
        },
      };
    } catch (error) {
      this.logger.error(`Error predicting cost: ${error.message}`);
      throw error;
    }
  }

  async analyzeRisks(): Promise<RiskAnalysis> {
    try {
      // In a real implementation, this would analyze project data
      // and use ML models to identify risks
      
      const riskFactors: RiskFactor[] = [
        {
          name: 'Material Price Volatility',
          severity: 'high',
          impact: 15,
          mitigation: 'Lock in prices with suppliers early',
        },
        {
          name: 'Weather Delays',
          severity: 'medium',
          impact: 10,
          mitigation: 'Build weather contingency into schedule',
        },
        {
          name: 'Labor Shortage',
          severity: 'medium',
          impact: 12,
          mitigation: 'Partner with multiple contractors',
        },
      ];
      
      const overallRiskScore = riskFactors.reduce((sum, risk) => {
        const severityScore = { low: 1, medium: 2, high: 3 }[risk.severity];
        return sum + (risk.impact * severityScore) / 100;
      }, 0);
      
      return {
        overallRiskScore,
        riskFactors,
        recommendations: [
          'Increase contingency budget by 10%',
          'Establish backup supplier relationships',
          'Create detailed risk management plan',
        ],
        potentialOverspend: 0.15, // 15% potential overrun
      };
    } catch (error) {
      this.logger.error(`Error analyzing risks: ${error.message}`);
      throw error;
    }
  }

  async optimizeBudget(): Promise<BudgetOptimization> {
    try {
      // Simplified optimization logic
      // In production, use ML models for optimization
      
      const originalBudget = 10000000; // Example budget in RUB
      
      const optimizations = [
        {
          category: 'Materials',
          originalCost: 4000000,
          optimizedCost: 3600000,
          description: 'Bulk purchasing and alternative materials',
        },
        {
          category: 'Labor',
          originalCost: 3000000,
          optimizedCost: 2850000,
          description: 'Optimized crew scheduling',
        },
        {
          category: 'Equipment',
          originalCost: 1000000,
          optimizedCost: 900000,
          description: 'Equipment sharing and rental optimization',
        },
      ];
      
      const optimizedBudget = optimizations.reduce(
        (sum, opt) => sum + opt.optimizedCost,
        2000000, // Fixed costs
      );
      
      return {
        originalBudget,
        optimizedBudget,
        savings: originalBudget - optimizedBudget,
        optimizations,
      };
    } catch (error) {
      this.logger.error(`Error optimizing budget: ${error.message}`);
      throw error;
    }
  }
}

