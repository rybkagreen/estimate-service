# API Endpoint Documentation Template

> **API Version:** v1  
> **Last Updated:** {DATE}  
> **Status:** {Active|Deprecated|Beta}  
> **Author:** {Author Name}

## Endpoint Overview

**Method:** `{GET|POST|PUT|PATCH|DELETE}`  
**Path:** `/api/v1/{resource}/{action}`  
**Summary:** {One-line description of what this endpoint does}

---

## Authentication

**Required:** {Yes|No}  
**Type:** {Bearer Token|API Key|OAuth2}  
**Permissions:** {List required permissions}

### Example Header

```http
Authorization: Bearer {your-token-here}
```

---

## Request

### Path Parameters

| Parameter | Type   | Required | Description   | Example   |
| --------- | ------ | -------- | ------------- | --------- |
| `{param}` | {type} | {Yes/No} | {description} | {example} |

### Query Parameters

| Parameter | Type   | Required | Default   | Description   | Example   |
| --------- | ------ | -------- | --------- | ------------- | --------- |
| `{param}` | {type} | {Yes/No} | {default} | {description} | {example} |

### Request Headers

| Header            | Required | Description   | Example            |
| ----------------- | -------- | ------------- | ------------------ |
| `Content-Type`    | Yes      | Media type    | `application/json` |
| `{Custom-Header}` | {Yes/No} | {description} | {example}          |

### Request Body

```typescript
interface {RequestInterface} {
  field1: string;           // Required: Description
  field2?: number;          // Optional: Description
  field3: {
    nestedField1: string;
    nestedField2: boolean;
  };
}
```

### Example Request

```bash
curl -X {METHOD} \
  https://api.estimate-service.com/v1/{endpoint} \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "field1": "value1",
    "field2": 123,
    "field3": {
      "nestedField1": "value",
      "nestedField2": true
    }
  }'
```

---

## Response

### Success Response

**Status Code:** `{200|201|204}`  
**Content-Type:** `application/json`

#### Response Schema

```typescript
interface {ResponseInterface} {
  success: boolean;
  data: {
    id: string;
    // Other fields
  };
  metadata?: {
    timestamp: string;
    version: string;
  };
}
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "field1": "value1",
    "field2": 123,
    "createdAt": "2024-07-06T10:30:00Z",
    "updatedAt": "2024-07-06T10:30:00Z"
  },
  "metadata": {
    "timestamp": "2024-07-06T10:30:00Z",
    "version": "1.0.0"
  }
}
```

### Error Responses

#### 400 Bad Request

**Cause:** Invalid request data or missing required fields

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "field1",
        "message": "Field is required"
      }
    ]
  }
}
```

#### 401 Unauthorized

**Cause:** Missing or invalid authentication token

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

#### 403 Forbidden

**Cause:** User lacks required permissions

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

#### 404 Not Found

**Cause:** Requested resource does not exist

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

#### 429 Too Many Requests

**Cause:** Rate limit exceeded

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "retryAfter": 3600
  }
}
```

#### 500 Internal Server Error

**Cause:** Unexpected server error

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "requestId": "req_123456789"
  }
}
```

---

## Rate Limiting

**Limit:** {X} requests per {time period}  
**Scope:** {Per user|Per IP|Per API key}  
**Headers:**

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Examples

### Example 1: {Basic Usage}

```javascript
// JavaScript/TypeScript example
const response = await fetch('https://api.estimate-service.com/v1/{endpoint}', {
  method: '{METHOD}',
  headers: {
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    field1: 'value1',
    field2: 123,
  }),
});

const result = await response.json();
console.log(result);
```

### Example 2: {Error Handling}

```typescript
try {
  const response = await apiClient.{method}('{endpoint}', data);
  console.log('Success:', response.data);
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error('Error:', error.response.data.error.message);
  } else if (error.request) {
    // Request made but no response
    console.error('Network error');
  } else {
    // Something else happened
    console.error('Error:', error.message);
  }
}
```

### Example 3: {Pagination}

```typescript
// Fetching paginated results
let page = 1;
let hasMore = true;
const allItems = [];

while (hasMore) {
  const response = await fetch(`/api/v1/{endpoint}?page=${page}&limit=100`);
  const result = await response.json();

  allItems.push(...result.data.items);
  hasMore = result.data.hasNextPage;
  page++;
}
```

---

## Webhooks (if applicable)

### Webhook Events

This endpoint may trigger the following webhook events:

| Event                | Description                    | Payload                  |
| -------------------- | ------------------------------ | ------------------------ |
| `{resource}.created` | Fired when resource is created | {Link to payload schema} |
| `{resource}.updated` | Fired when resource is updated | {Link to payload schema} |

### Webhook Payload Example

```json
{
  "event": "{resource}.created",
  "timestamp": "2024-07-06T10:30:00Z",
  "data": {
    // Resource data
  }
}
```

---

## SDK Support

### TypeScript/JavaScript

```typescript
import { EstimateClient } from '@estimate-service/sdk';

const client = new EstimateClient({ apiKey: 'your-api-key' });
const result = await client.{resource}.{action}({
  // parameters
});
```

### Python

```python
from estimate_service import Client

client = Client(api_key='your-api-key')
result = client.{resource}.{action}(
    # parameters
)
```

---

## Notes & Considerations

### Performance

- {Performance consideration 1}
- {Performance consideration 2}

### Best Practices

- {Best practice 1}
- {Best practice 2}

### Known Limitations

- {Limitation 1}
- {Limitation 2}

### Migration Notes

{Any notes about migrating from previous versions}

---

## Related Endpoints

- [`GET /api/v1/{related-endpoint}`](link) - {Description}
- [`POST /api/v1/{related-endpoint}`](link) - {Description}

---

## Changelog

| Version   | Date   | Changes         |
| --------- | ------ | --------------- |
| 1.0.0     | {Date} | Initial release |
| {Version} | {Date} | {Changes}       |

---

## Support

**Contact:** {support@example.com}  
**Documentation:** {Link to main docs}  
**Status Page:** {Link to API status}
