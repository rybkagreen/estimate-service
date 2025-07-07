# AI Assistant Services

This directory contains services used by the AI Assistant module for validating and enhancing AI-generated responses.

## Services Overview

### HistoricalEstimateService

The `HistoricalEstimateService` provides functionality to compare AI-generated estimates against historical data to ensure accuracy and reasonableness.

#### Key Features:
- Compare responses with historical project data
- Detect outliers and anomalies
- Provide benchmark data for different project types
- Analyze historical trends
- Find similar projects for comparison

#### Main Methods:

```typescript
// Compare a response with historical data
const comparison = await historicalEstimateService.compareWithHistorical(
  response,
  context,
  {
    includeInflationAdjustment: true,
    locationFilter: 'New York',
    maxSimilarProjects: 5
  }
);

// Get historical statistics for a metric
const stats = await historicalEstimateService.getHistoricalStatistics(
  'costPerSqm',
  'residential',
  {
    location: 'California',
    buildingType: BuildingType.RESIDENTIAL
  }
);

// Check if a value is an outlier
const outlierCheck = await historicalEstimateService.checkForOutliers(
  'duration',
  36, // months
  { projectType: 'commercial' }
);

// Get benchmark data
const benchmarks = await historicalEstimateService.getBenchmarkData(
  BuildingType.COMMERCIAL,
  'San Francisco'
);

// Analyze historical trends
const trends = await historicalEstimateService.getHistoricalTrends(
  'costPerSqm',
  {
    start: new Date('2020-01-01'),
    end: new Date('2023-12-31'),
    granularity: 'quarterly'
  }
);
```

### ClaudeValidatorService

The `ClaudeValidatorService` uses Claude 3.5 Sonnet to perform advanced validation of AI responses, checking for logical consistency, accuracy, and quality.

#### Key Features:
- Multiple validation levels (quick, standard, thorough)
- Semantic analysis of responses
- Quality metrics evaluation
- Hallucination detection
- Domain knowledge validation

#### Main Methods:

```typescript
// Validate a response with Claude
const validation = await claudeValidatorService.validateWithClaude(
  response,
  context,
  {
    validationType: 'thorough',
    includeSemanticAnalysis: true,
    includeQualityMetrics: true
  }
);

// Check for hallucinations
const hallucinationCheck = await claudeValidatorService.detectHallucinations(
  response,
  context
);

// Validate against domain knowledge
const domainValidation = await claudeValidatorService.validateAgainstDomainKnowledge(
  response,
  AnalysisType.COST_ESTIMATION
);
```

### ResponseBuilderService

The `ResponseBuilderService` orchestrates the validation process using both historical data and Claude validation to ensure high-quality responses.

#### Validation Levels:
1. **Level 1**: Internal contradiction checker
   - Checks for logical inconsistencies
   - Validates number contradictions
   - Ensures unit consistency
   - Verifies date consistency

2. **Level 2**: Historical estimate comparison
   - Compares with historical data
   - Identifies deviations from norms
   - Finds similar projects

3. **Level 3**: Claude 3.5 Sonnet validation
   - Advanced semantic analysis
   - Quality assessment
   - Hallucination detection

#### Fallback Strategy:
If overall confidence < 0.8, the service implements fallback actions:
- `retry`: Retry with enhanced context
- `alternative_model`: Use a different AI model
- `human_review`: Flag for human review
- `degraded_response`: Proceed with warnings

## Usage Example

```typescript
import { 
  ResponseBuilderService,
  HistoricalEstimateService,
  ClaudeValidatorService 
} from './services';

// In your module
@Module({
  providers: [
    ResponseBuilderService,
    HistoricalEstimateService,
    ClaudeValidatorService,
  ],
})
export class AiAssistantModule {}

// In your service or controller
constructor(
  private readonly responseBuilder: ResponseBuilderService,
) {}

async validateAIResponse(response: any, context: any) {
  const validation = await this.responseBuilder.validateResponse(
    response,
    context
  );

  if (!validation.isValid || validation.requiresFallback) {
    // Handle invalid response or implement fallback
    if (validation.fallbackAction?.type === 'retry') {
      // Retry with enhanced prompt
    } else if (validation.fallbackAction?.type === 'human_review') {
      // Flag for human review
    }
  }

  return {
    response,
    validation,
    confidence: validation.overallConfidence,
    warnings: validation.recommendations
  };
}
```

## Interfaces

### HistoricalComparison
```typescript
interface HistoricalComparison {
  isWithinRange: boolean;
  confidence: number;
  deviations?: HistoricalDeviation[];
  historicalRange?: HistoricalRange;
  similarProjects?: SimilarProject[];
  analysisMetadata?: {
    dataPoints: number;
    dateRange: { start: Date; end: Date };
    geographicScope: string;
    adjustedForInflation: boolean;
  };
}
```

### ClaudeValidationResult
```typescript
interface ClaudeValidationResult {
  isValid: boolean;
  confidence: number;
  issues?: ValidationIssue[];
  recommendations?: string[];
  semanticAnalysis?: SemanticAnalysis;
  qualityMetrics?: QualityMetrics;
}
```

### ResponseValidation
```typescript
interface ResponseValidation {
  isValid: boolean;
  overallConfidence: number;
  levels: {
    level1: ValidationResult;
    level2: ValidationResult;
    level3: ValidationResult;
  };
  recommendations?: string[];
  requiresFallback?: boolean;
  fallbackAction?: FallbackAction;
}
```

## Testing

Both services include comprehensive test coverage. Run tests with:

```bash
npm test src/modules/ai-assistant/services
```

## Future Enhancements

1. **HistoricalEstimateService**:
   - Connect to real historical database
   - Machine learning for similarity matching
   - Regional price adjustments
   - Seasonal variations analysis

2. **ClaudeValidatorService**:
   - Actual Claude API integration
   - Custom validation prompts
   - Multi-language support
   - Industry-specific validation rules

3. **ResponseBuilderService**:
   - Configurable confidence thresholds
   - Custom validation pipelines
   - Response enhancement suggestions
   - A/B testing support
