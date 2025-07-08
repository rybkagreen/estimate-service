# Prediction Module

## Overview

The Prediction Module provides AI-powered cost estimation, risk analysis, and budget optimization for construction projects using machine learning models from Hugging Face.

## Features

- **Cost Prediction**: Estimates project costs based on parameters like area, location, materials, and project type
- **Risk Analysis**: Identifies potential risks and calculates probability of budget overruns
- **Budget Optimization**: Suggests cost-saving opportunities while maintaining project quality

## API Endpoints

### 1. Predict Project Cost
```
POST /prediction/predict/cost
```

Request body:
```json
{
  "projectName": "New Office Building",
  "projectType": "commercial",
  "area": 5000,
  "floors": 10,
  "materials": ["concrete", "steel", "glass"],
  "location": "moscow",
  "startDate": "2024-03-01",
  "endDate": "2024-12-31"
}
```

Response:
```json
{
  "estimatedCost": 250000000,
  "confidence": 0.85,
  "breakdown": {
    "materials": 100000000,
    "labor": 75000000,
    "equipment": 25000000,
    "overhead": 37500000,
    "contingency": 12500000
  },
  "metadata": {
    "modelVersion": "1.0.0",
    "timestamp": "2024-01-08T12:00:00Z",
    "parameters": {...}
  }
}
```

### 2. Analyze Project Risks
```
GET /prediction/analyze/risks
```

Response:
```json
{
  "overallRiskScore": 0.65,
  "riskFactors": [
    {
      "name": "Material Price Volatility",
      "severity": "high",
      "impact": 15,
      "mitigation": "Lock in prices with suppliers early"
    }
  ],
  "recommendations": [
    "Increase contingency budget by 10%",
    "Establish backup supplier relationships"
  ],
  "potentialOverspend": 0.15
}
```

### 3. Optimize Budget
```
GET /prediction/optimize/budget
```

Response:
```json
{
  "originalBudget": 10000000,
  "optimizedBudget": 9350000,
  "savings": 650000,
  "optimizations": [
    {
      "category": "Materials",
      "originalCost": 4000000,
      "optimizedCost": 3600000,
      "description": "Bulk purchasing and alternative materials"
    }
  ]
}
```

## Configuration

Add the following environment variables to your `.env` file:

```env
# Hugging Face API Configuration
HUGGINGFACE_API_KEY=your_api_key_here

# Model Configuration
HF_COST_PREDICTION_MODEL=sentence-transformers/all-MiniLM-L6-v2
HF_RISK_ANALYSIS_MODEL=nlptown/bert-base-multilingual-uncased-sentiment
```

## Architecture

The module consists of:

1. **PredictionController**: Handles HTTP requests and responses
2. **PredictionService**: Contains business logic for predictions
3. **HuggingFaceService**: Manages integration with Hugging Face API
4. **DTOs**: Data transfer objects for request/response validation
5. **Interfaces**: Type definitions for prediction results

## Testing

Run unit tests:
```bash
npm run test prediction.service
```

## Future Enhancements

1. **Custom ML Models**: Train domain-specific models for construction cost estimation
2. **Historical Data Integration**: Use past project data to improve predictions
3. **Real-time Market Data**: Integrate current material prices and labor costs
4. **Multi-region Support**: Add regional cost variations and regulations
5. **Confidence Intervals**: Provide range estimates instead of single values

## Dependencies

- `@nestjs/common`: NestJS framework
- `@nestjs/axios`: HTTP client for API calls
- `class-validator`: Input validation
- `@nestjs/swagger`: API documentation

## Contributing

When adding new features:
1. Update interfaces in `interfaces/prediction.interface.ts`
2. Add corresponding DTOs with validation
3. Implement business logic in services
4. Add unit tests for new functionality
5. Update this README with new endpoints
