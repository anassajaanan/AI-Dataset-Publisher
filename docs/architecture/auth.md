# Authentication and Authorization

This document describes the authentication and authorization system used in the Dataset Publishing Platform.

## Overview

The Dataset Publishing Platform implements a comprehensive authentication and authorization system to secure access to the application and its resources. The system uses JSON Web Tokens (JWT) for authentication, with role-based access control (RBAC) for authorization. The system supports multiple authentication methods, including username/password, OAuth 2.0, and API keys for programmatic access.

## Authentication Methods

### Username/Password Authentication

The platform supports traditional username/password authentication with the following features:

- Secure password storage using bcrypt hashing
- Password complexity requirements (minimum length, special characters, etc.)
- Account lockout after multiple failed login attempts
- Password reset via email
- Two-factor authentication (2FA) support

### OAuth 2.0 Authentication

The platform supports OAuth 2.0 authentication with the following providers:

- Google
- Microsoft
- GitHub
- Custom OAuth providers

OAuth 2.0 authentication flow:

1. User clicks on "Sign in with [Provider]" button
2. User is redirected to the provider's authentication page
3. User authenticates with the provider
4. Provider redirects back to the platform with an authorization code
5. Platform exchanges the authorization code for an access token
6. Platform verifies the access token and creates a session

### API Key Authentication

For programmatic access to the API, the platform supports API key authentication:

- API keys are generated for users with appropriate permissions
- API keys have configurable scopes and expiration dates
- API keys can be revoked at any time
- Rate limiting is applied to API key usage

## Token Management

The platform uses JWT (JSON Web Tokens) for managing authentication:

- Access tokens with short expiration (15 minutes)
- Refresh tokens with longer expiration (7 days)
- Token rotation on refresh
- Token revocation on logout or security breach
- Token validation on each request

JWT payload structure:

```json
{
  "sub": "user123",
  "name": "John Doe",
  "email": "john@example.com",
  "roles": ["user", "editor"],
  "permissions": ["read:datasets", "write:datasets"],
  "iat": 1516239022,
  "exp": 1516239922
}
```

## Authorization Model

### Role-Based Access Control (RBAC)

The platform implements RBAC with the following roles:

- **Guest**: Unauthenticated users with limited access
- **User**: Basic authenticated users who can upload and manage their own datasets
- **Editor**: Users who can edit and review datasets
- **Supervisor**: Users who can approve or reject datasets for publication
- **Administrator**: Users with full access to all platform features

### Permission System

Each role has a set of permissions that define what actions they can perform:

- **read:datasets**: View datasets
- **write:datasets**: Create and edit datasets
- **delete:datasets**: Delete datasets
- **publish:datasets**: Publish datasets
- **review:datasets**: Review datasets
- **manage:users**: Manage user accounts
- **manage:system**: Configure system settings

Permissions are checked at both the API and UI levels to ensure consistent security.

## Implementation Details

### Authentication Flow

The authentication flow is implemented as follows:

1. User submits credentials (username/password, OAuth token, or API key)
2. Server validates credentials
3. If valid, server generates JWT access and refresh tokens
4. Tokens are returned to the client
5. Client stores tokens (access token in memory, refresh token in HTTP-only cookie)
6. Client includes access token in Authorization header for subsequent requests
7. When access token expires, client uses refresh token to obtain a new access token

### Authorization Middleware

The platform uses middleware to check authorization for each request:

```typescript
// Example authorization middleware
export function authorize(requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract token from Authorization header
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user has required permissions
      const hasPermission = requiredPermissions.every(
        permission => decoded.permissions.includes(permission)
      );
      
      if (!hasPermission) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      // Add user info to request
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
}
```

### Frontend Authorization

On the frontend, authorization is implemented using React Context and custom hooks:

```typescript
// Example useAuth hook
export function useAuth() {
  const { user } = useContext(AuthContext);
  
  return {
    isAuthenticated: !!user,
    user,
    hasPermission: (permission: string) => {
      return user?.permissions.includes(permission) || false;
    },
    hasRole: (role: string) => {
      return user?.roles.includes(role) || false;
    }
  };
}

// Example usage in a component
function DatasetActions({ dataset }) {
  const { hasPermission } = useAuth();
  
  return (
    <div>
      {hasPermission('write:datasets') && (
        <button>Edit Dataset</button>
      )}
      {hasPermission('publish:datasets') && (
        <button>Publish Dataset</button>
      )}
    </div>
  );
}
```

## Security Considerations

The authentication and authorization system implements several security measures:

- HTTPS for all communications
- HTTP-only cookies for refresh tokens
- CSRF protection
- Rate limiting for login attempts
- Token expiration and rotation
- Secure password storage
- Input validation and sanitization
- Audit logging for security events

## API Endpoints

### Authentication Endpoints

#### Login

```
POST /api/auth/login
```

Authenticates a user with username and password.

**Request:**

```json
{
  "username": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "roles": ["user"]
    }
  }
}
```

#### Refresh Token

```
POST /api/auth/refresh
```

Refreshes an expired access token using a refresh token.

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Logout

```
POST /api/auth/logout
```

Logs out a user by invalidating their tokens.

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Configuration Options

The authentication and authorization system can be configured with the following options:

- JWT secret key and algorithm
- Token expiration times
- Password complexity requirements
- OAuth provider settings
- API key settings
- Rate limiting settings
- Session management settings

## Future Enhancements

Planned enhancements for the authentication and authorization system include:

- Single Sign-On (SSO) integration
- Advanced multi-factor authentication options
- Passwordless authentication
- Fine-grained permission system
- User activity monitoring
- Risk-based authentication
- Compliance with additional security standards 