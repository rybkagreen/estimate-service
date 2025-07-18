# AI Assistant Service

AI-powered assistant service for construction estimates.

## Overview

This service provides AI capabilities for the estimate service, including:
- **Core**: Core AI functionality and configuration
- **Chat**: Real-time chat and conversational AI
- **Knowledge**: Knowledge base management for construction data
- **Analytics**: Analytics and insights generation

## Port Configuration

The service runs on port **3005** by default.

## Modules

### Core Module
- AI model configuration
- Request validation
- Core service initialization

### Chat Module
- WebSocket support for real-time communication
- Session management
- Message history

### Knowledge Module
- Knowledge base CRUD operations
- Search functionality
- Category management

### Analytics Module
- Data analytics
- Report generation
- Insights extraction

## API Documentation

Once the service is running, you can access the Swagger documentation at:
```
http://localhost:3005/api/docs
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Application
PORT=3005
HOST=0.0.0.0

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/estimate_service"

# AI Configuration
AI_MODEL="gpt-4"
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=2000
```

## Running the Service

```bash
# Development
npm run dev:ai-assistant

# or using Nx
npx nx serve ai-assistant

# Production
npx nx serve ai-assistant --configuration=production
```

## Testing

```bash
# Unit tests
npx nx test ai-assistant

# E2E tests
npx nx e2e ai-assistant-e2e
```

## Integration with Existing Services

This service integrates with:
- **Estimate Service**: Provides AI capabilities for estimate generation
- **Auth Service**: Uses JWT authentication
- **Database**: Shares the same PostgreSQL database using Prisma

## WebSocket Events

### Chat Events
- `createSession`: Create a new chat session
- `sendMessage`: Send a message to the AI
- `messageResponse`: Receive AI response

## API Endpoints

### Core
- `GET /api/ai-assistant/core/config` - Get AI configuration
- `GET /api/ai-assistant/core/health` - Health check

### Chat
- `POST /api/ai-assistant/chat/session` - Create chat session
- `POST /api/ai-assistant/chat/session/:id/message` - Send message
- `GET /api/ai-assistant/chat/session/:id/history` - Get chat history

### Knowledge
- `GET /api/ai-assistant/knowledge/search` - Search knowledge base
- `GET /api/ai-assistant/knowledge/categories` - Get categories
- `POST /api/ai-assistant/knowledge` - Add knowledge item

### Analytics
- `POST /api/ai-assistant/analytics` - Add analytics data
- `GET /api/ai-assistant/analytics` - List analytics data
- `GET /api/ai-assistant/analytics/:id` - Get specific analytics
