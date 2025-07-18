# Unified AI Service

## Overview
This service provides a unified interface for AI capabilities, including:
- Task planning
- Task execution
- Knowledge management
- Analytics

## API Methods

### planTask(request: TaskPlanRequest): TaskPlanResponse
Generates an execution plan for a given task.

### executeTask(taskId: string): TaskPlanResponse
Executes a planned task.

### manageKnowledge(knowledgeData: any): void
Manages knowledge base data.

### getAnalytics(filters: any): any
Returns analytics data.

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Client
    participant UnifiedAIService
    participant ModelManager
    participant KnowledgeBase

    Client->>UnifiedAIService: planTask(request)
    UnifiedAIService->>KnowledgeBase: getTaskContext()
    KnowledgeBase-->>UnifiedAIService: context
    UnifiedAIService->>ModelManager: selectModel('planning')
    ModelManager-->>UnifiedAIService: model
    UnifiedAIService->>model: generatePlan()
    model-->>UnifiedAIService: plan
    UnifiedAIService-->>Client: TaskPlanResponse

    Client->>UnifiedAIService: executeTask(taskId)
    UnifiedAIService->>model: execute(step)
    model-->>UnifiedAIService: result
    UnifiedAIService-->>Client: TaskPlanResponse
