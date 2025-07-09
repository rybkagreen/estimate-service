# Estimate Service Database Implementation

## Overview
This document describes the implementation of proper database logic in the estimate service backend using Prisma ORM with PostgreSQL.

## Implementation Details

### 1. Data Transfer Objects (DTOs)
Created comprehensive DTOs for type-safe data handling:

- **CreateEstimateDto** (`create-estimate.dto.ts`)
  - Validates input data for creating new estimates
  - Includes fields: name, description, projectId, currency, laborCostPerHour, overheadPercentage, profitPercentage, metadata

- **UpdateEstimateDto** (`update-estimate.dto.ts`)
  - Extends CreateEstimateDto with partial fields
  - Adds status field for status updates

- **EstimateFilterDto** (`estimate-filter.dto.ts`)
  - Comprehensive filtering options: projectId, status, createdById, date ranges, cost ranges, search
  - Pagination support: page, pageSize
  - Sorting options: sortBy, sortOrder

### 2. Service Layer Implementation

#### EstimateService (`estimate.service.ts`)
Core service with database operations:

- **findAll(filter: EstimateFilterDto)**
  - Supports filtering, pagination, and sorting
  - Returns paginated results with total count
  - Includes related data: project, createdBy, approvedBy, item counts
  - Implements caching with 5-minute TTL

- **findOne(id: string)**
  - Retrieves single estimate with all related data
  - Includes items sorted by sortOrder
  - Implements caching with 10-minute TTL

- **create(createEstimateDto: CreateEstimateDto, userId: string)**
  - Validates project existence
  - Creates estimate with DRAFT status
  - Initializes cost fields to 0
  - Clears list cache after creation

#### EstimateExtendedService (`estimate-extended.service.ts`)
Extended functionality:

- **update(id: string, updateEstimateDto: UpdateEstimateDto, userId: string)**
  - Validates estimate existence
  - Prevents editing of approved estimates
  - Increments version number
  - Clears relevant caches

- **delete(id: string, userId: string)**
  - Validates estimate existence
  - Prevents deletion of approved estimates
  - Cascade deletes estimate items
  - Clears caches

- **updateStatus(id: string, status: EstimateStatus, userId: string)**
  - Validates status transitions
  - Records approver and approval date for APPROVED status
  - Implements state machine for status transitions

- **duplicate(id: string, userId: string)**
  - Creates a copy of estimate with all items
  - Sets new estimate to DRAFT status
  - Links to parent estimate for versioning

- **calculateTotals(id: string)**
  - Recalculates all cost fields based on items
  - Updates materialCost, laborCost, overheadCost, profitCost, totalCost
  - Returns breakdown of costs

### 3. Controller Implementation (`estimate.controller.ts`)

RESTful endpoints with proper decorators:

- `GET /estimates` - List estimates with filters
- `GET /estimates/:id` - Get single estimate
- `POST /estimates` - Create new estimate
- `PUT /estimates/:id` - Update estimate
- `DELETE /estimates/:id` - Delete estimate
- `PATCH /estimates/:id/status` - Update estimate status
- `POST /estimates/:id/duplicate` - Duplicate estimate
- `POST /estimates/:id/calculate` - Recalculate totals
- `POST /estimates/:id/export` - Export estimate (TODO)

### 4. Database Schema Integration

The implementation uses the existing Prisma schema with these models:
- **Estimate** - Main estimate entity
- **EstimateItem** - Line items in estimates
- **Project** - Related project data
- **User** - Creator and approver information

### 5. Caching Strategy

- List queries: 5-minute cache with tag-based invalidation
- Detail queries: 10-minute cache
- Cache invalidation on create, update, delete operations
- Enhanced cache service with tag support for efficient invalidation

### 6. Error Handling

- NotFoundException for missing resources
- BadRequestException for invalid operations
- InternalServerErrorException for database errors
- Proper error propagation to controller

### 7. Security Considerations

- User ID passed from authenticated request context
- Permission checks for status transitions
- Validation of input data with class-validator

## Next Steps

1. **Authentication Integration**
   - Implement JWT authentication guards
   - Add role-based access control

2. **Testing**
   - Unit tests for services
   - Integration tests for controllers
   - E2E tests for API endpoints

3. **Export Functionality**
   - Implement PDF export
   - Implement Excel export
   - Implement JSON export

4. **Estimate Items Management**
   - CRUD operations for estimate items
   - Batch operations for items
   - Item templates

5. **Performance Optimization**
   - Database query optimization
   - Implement database connection pooling
   - Add database indices for common queries

## Usage Example

```typescript
// Create estimate
const estimate = await estimateService.create({
  name: 'Новая смета',
  projectId: 'project-123',
  currency: 'RUB',
  laborCostPerHour: 1500,
  overheadPercentage: 15,
  profitPercentage: 20
}, 'user-123');

// Update estimate
const updated = await extendedService.update(estimate.id, {
  name: 'Обновленная смета',
  description: 'Добавлено описание'
}, 'user-123');

// Change status
const approved = await extendedService.updateStatus(
  estimate.id, 
  EstimateStatus.APPROVED, 
  'approver-123'
);

// Calculate totals
const totals = await extendedService.calculateTotals(estimate.id);
```

## Dependencies

- **@prisma/client** - Database ORM
- **class-validator** - DTO validation
- **class-transformer** - DTO transformation
- **@nestjs/swagger** - API documentation

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/estimate_db"
REDIS_HOST="localhost"
REDIS_PORT="6379"
```
