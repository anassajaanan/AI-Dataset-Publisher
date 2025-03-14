# API Documentation

This section provides comprehensive documentation for all API endpoints in the Dataset Publishing Platform.

## Available Endpoints

- [Upload API](./upload.md) - Endpoints for file upload and processing
- [Metadata API](./metadata.md) - Endpoints for AI-powered metadata generation and management
- [Datasets API](./datasets.md) - Endpoints for dataset management, versioning, and publishing workflow

## API Structure

The API follows RESTful principles and is organized into logical groups based on functionality. All endpoints return JSON responses and use standard HTTP status codes to indicate success or failure.

## Authentication

Most API endpoints require authentication. The platform uses JWT (JSON Web Tokens) for authentication. Include the JWT token in the Authorization header of your requests:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

Common error codes include:

- `INVALID_REQUEST` - The request is malformed or missing required parameters
- `UNAUTHORIZED` - Authentication is required or the provided credentials are invalid
- `FORBIDDEN` - The authenticated user does not have permission to perform the requested action
- `NOT_FOUND` - The requested resource does not exist
- `VALIDATION_ERROR` - The request contains invalid data
- `INTERNAL_ERROR` - An unexpected error occurred on the server

## Rate Limiting

API endpoints are rate-limited to prevent abuse. The current rate limits are:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1615563200
``` 