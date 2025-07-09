# GitHub Copilot Configuration Guide

## Overview
This document provides configuration details for GitHub Copilot in the Estimate Service project. It ensures that Copilot understands the project context and provides relevant suggestions.

## Project Structure

### Monorepo Architecture
This project uses Nx 17.2.8 for monorepo management with the following structure:

### Applications (apps/ and services/)
- **apps/estimate-frontend** - React-based frontend application with Vite and Tailwind CSS
- **services/estimate-service** - Main NestJS backend service for estimate management
- **services/ai-assistant** - AI integration service using DeepSeek R1 for estimate analysis
- **services/data-collector** - Automated service for collecting ФСБЦ-2022 pricing data
- **services/knowledge-base** - Document management and search service with vector embeddings
- **mcp-server/** - Model Context Protocol server for AI communication

### Libraries (libs/)
- **libs/shared-contracts** - Shared TypeScript types, interfaces, and DTOs

### Configuration Files
- **nx.json** - Nx workspace configuration
- **project.json** - Individual project configurations
- **tsconfig.base.json** - Base TypeScript configuration
- **prisma/schema.prisma** - Database schema definition

## Key Technologies

### Backend Stack
- **NestJS** - Enterprise Node.js framework with decorators
- **TypeScript** - Type-safe JavaScript (strict mode enabled)
- **Prisma ORM** - Next-generation ORM with type safety
- **PostgreSQL 15+** - Primary database for persistence
- **Redis 7+** - Caching and session management
- **Bull** - Queue management for background jobs
- **JWT** - Authentication and authorization

### Frontend Stack
- **React 18** - UI library with hooks and concurrent features
- **TypeScript** - Full type safety across the application
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **TanStack Query** - Server state management
- **React Hook Form** - Performant forms with validation

### AI/ML Stack
- **DeepSeek R1** - Advanced language model for Russian/English
- **Hugging Face** - Model hosting and inference
- **Model Context Protocol (MCP)** - Standardized AI communication
- **Vector Embeddings** - Semantic search capabilities

### Infrastructure
- **Docker** - Containerization for all services
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD pipelines
- **GitHub Codespaces** - Cloud development environment
- **Nx** - Monorepo build system with caching

## Development Commands
```bash
# Install dependencies
npm install

# Run all services
npm run dev:all

# Run specific services
npm run dev:frontend
npm run dev:backend
npm run dev:ai-assistant
npm run dev:mcp

# Build all projects
npm run build:all

# Run tests
npm run test:all

# Lint code
npm run lint:all
```

## Copilot Context Files
- `.github/copilot-prompts.json` - Pre-defined prompts for common tasks
- `.github/copilot-workspace-manifest.json` - Project structure and metadata
- `.github/copilot-workspace.yml` - Workspace configuration
- `.github/copilot-tasks/common-tasks.json` - Common development tasks
- `.nx/copilot-config.json` - Nx-specific Copilot configuration

## Best Practices
1. Use domain-specific terminology (ФСБЦ-2022, Гранд Смета)
2. Follow NestJS and React conventions
3. Include comprehensive tests for all new features
4. Document APIs using Swagger/OpenAPI
5. Use TypeScript strict mode
6. Follow the established file naming conventions

## Architecture Patterns

### Domain-Driven Design (DDD)
- **Entities**: Core business objects with identity
- **Value Objects**: Immutable objects without identity
- **Aggregates**: Clusters of entities and value objects
- **Repositories**: Data access abstraction
- **Domain Services**: Business logic that doesn't fit in entities

### Clean Architecture Layers
1. **Domain Layer**: Business logic and entities
2. **Application Layer**: Use cases and DTOs
3. **Infrastructure Layer**: External services and data access
4. **Presentation Layer**: Controllers and UI components

### NestJS Patterns
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic implementation
- **Repositories**: Data access using Prisma
- **DTOs**: Data transfer objects with class-validator
- **Guards**: JWT authentication and RBAC authorization
- **Interceptors**: Logging, transformation, and caching
- **Pipes**: Validation and transformation pipelines
- **Filters**: Exception handling and error formatting

### React Patterns
- **Component Composition**: Building complex UIs from simple components
- **Custom Hooks**: Reusable stateful logic
- **Context API**: Global state management
- **Render Props**: Component logic sharing
- **Higher-Order Components**: Component enhancement

## Integration Points

### External APIs
- **ФСБЦ-2022 API**: Federal construction pricing database
  - RESTful API with authentication
  - Rate limiting and caching strategies
  - Automatic updates via scheduled jobs

- **Grand Smeta Integration**: Industry-standard export format
  - Excel/XML export capabilities
  - Format validation and conversion
  - Compatibility with versions 2022-2024

### AI Integration
- **MCP Server**: Standardized AI communication protocol
  - WebSocket and HTTP endpoints
  - Request/response formatting
  - Context window management
  - Error handling and retries

- **DeepSeek R1 API**: Language model integration
  - Prompt engineering for construction domain
  - Response parsing and validation
  - Token usage optimization

### Data Storage
- **PostgreSQL**: Primary data persistence
  - Prisma migrations for schema management
  - Connection pooling optimization
  - Read replicas for scaling

- **Redis**: Caching and session storage
  - Cache invalidation strategies
  - Pub/Sub for real-time updates
  - Session management with TTL

### File Processing
- **Excel Import/Export**: XLSX file handling
- **PDF Generation**: Estimate reports and documentation
- **CSV Processing**: Bulk data import/export
- **Image Storage**: S3-compatible object storage

## Security Considerations

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with refresh tokens
- **RBAC**: Role-based access control (Admin, Manager, Estimator, Viewer)
- **OAuth 2.0**: Third-party authentication support
- **API Keys**: Service-to-service authentication

### Data Protection
- **Encryption**: AES-256 for sensitive data at rest
- **TLS 1.3**: Encrypted communication in transit
- **Password Hashing**: Bcrypt with salt rounds
- **PII Protection**: Personal data anonymization

### Input Validation
- **class-validator**: DTO validation with decorators
- **Sanitization**: HTML and SQL injection prevention
- **File Upload**: Type validation and virus scanning
- **Rate Limiting**: DDoS protection and API throttling

### Security Headers
- **Helmet.js**: Security headers middleware
- **CORS**: Configured origin restrictions
- **CSP**: Content Security Policy implementation
- **HSTS**: HTTP Strict Transport Security

### Monitoring & Compliance
- **Audit Logging**: All data modifications tracked
- **Security Scanning**: Automated vulnerability detection
- **GDPR Compliance**: Data retention and deletion policies
- **Penetration Testing**: Regular security assessments
