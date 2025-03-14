# System Architecture

This document provides a high-level overview of the system architecture for the Dataset Publishing Platform.

## Architecture Overview

The Dataset Publishing Platform follows a modern web application architecture with a Next.js frontend and backend, MongoDB database, and integration with AI services for metadata generation.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js Server                          │
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────┐    ┌────────────┐  │
│  │   React Pages   │    │   API Routes     │    │  Middleware │  │
│  └────────┬────────┘    └────────┬─────────┘    └─────┬──────┘  │
│           │                      │                    │         │
│           ▼                      ▼                    ▼         │
│  ┌─────────────────┐    ┌──────────────────┐    ┌────────────┐  │
│  │  UI Components  │    │  Service Layer   │    │   Auth     │  │
│  └─────────────────┘    └────────┬─────────┘    └────────────┘  │
│                                  │                              │
└──────────────────────────────────┼──────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────┼──────────────────────────────┐
│                                  │                              │
│  ┌─────────────────┐    ┌────────┴─────────┐    ┌────────────┐  │
│  │  MongoDB Atlas  │◄───┤  Data Access     │    │ File Store │  │
│  └─────────────────┘    └──────────────────┘    └────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────┼──────────────────────────────┐
│                                  │                              │
│  ┌─────────────────┐    ┌────────┴─────────┐                    │
│  │   OpenAI API    │◄───┤  AI Integration  │                    │
│  └─────────────────┘    └──────────────────┘                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Component Descriptions

### Client Layer

- **React Pages**: Next.js pages that provide the user interface for the application.
- **UI Components**: Reusable React components for building the user interface.
- **Client-Side State**: Managed using Zustand and React Query for local and server state.

### Server Layer

- **Next.js Server**: Handles server-side rendering and API requests.
- **API Routes**: Next.js API routes that provide the backend functionality.
- **Middleware**: Handles cross-cutting concerns such as authentication and logging.
- **Service Layer**: Contains the business logic for the application.
- **Auth Service**: Handles user authentication and authorization using NextAuth.js.

### Data Layer

- **Data Access Layer**: Provides an abstraction for accessing the database.
- **MongoDB Atlas**: Cloud-hosted MongoDB database for storing application data.
- **File Store**: Storage for uploaded dataset files.

### External Services

- **AI Integration**: Integration with AI services for metadata generation.
- **OpenAI API**: Used for generating dataset metadata based on content analysis.

## Key Workflows

### Dataset Upload Workflow

1. User uploads a dataset file through the UI.
2. The file is sent to the `/api/upload/file` endpoint.
3. The file is validated and processed by the upload service.
4. File metadata is extracted and stored in the database.
5. The file is stored in the file store.
6. The user is redirected to the metadata editing page.

### Metadata Generation Workflow

1. User requests metadata generation for a dataset.
2. The request is sent to the `/api/metadata/generate` endpoint.
3. The metadata service retrieves the dataset content.
4. The content is sent to the OpenAI API for analysis.
5. The AI-generated metadata is returned to the client.
6. The user reviews and edits the metadata.
7. The metadata is saved to the database.

### Publishing Workflow

1. User submits a dataset for review.
2. The dataset status is updated to "pending_review".
3. Supervisors are notified of the pending review.
4. A supervisor reviews the dataset and metadata.
5. The supervisor approves or rejects the dataset.
6. If approved, the dataset status is updated to "published".
7. If rejected, the dataset status is updated to "rejected" with feedback.
8. The user is notified of the review result.

## Scalability Considerations

The architecture is designed to scale horizontally to handle increasing load:

1. **Stateless Server**: The Next.js server is stateless, allowing for horizontal scaling.
2. **Database Scaling**: MongoDB Atlas provides automatic scaling and sharding.
3. **File Storage**: The file store can be scaled independently.
4. **Caching**: Implemented at various levels to reduce load on the database and API.
5. **API Rate Limiting**: Prevents abuse and ensures fair resource allocation.

## Deployment Architecture

The application is deployed on Vercel, which provides a global CDN and edge network for optimal performance:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Vercel Edge Network                     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js Server                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────┐
│    MongoDB Atlas    │  │    File Storage     │  │   OpenAI API  │
└─────────────────────┘  └─────────────────────┘  └───────────────┘
```

## Security Architecture

The application implements a defense-in-depth security strategy:

1. **Edge Security**: Vercel's edge network provides DDoS protection and WAF.
2. **Authentication**: NextAuth.js handles user authentication.
3. **Authorization**: Role-based access control for different user types.
4. **Input Validation**: All user inputs are validated and sanitized.
5. **HTTPS**: All communication is encrypted using HTTPS.
6. **Secure Headers**: HTTP security headers for additional protection.
7. **Database Security**: MongoDB Atlas provides encryption at rest and in transit.
8. **API Security**: API rate limiting and authentication.

## Monitoring and Logging

The application includes comprehensive monitoring and logging:

1. **Application Logs**: Structured logs for application events.
2. **Error Tracking**: Integration with error tracking services.
3. **Performance Monitoring**: Monitoring of application performance metrics.
4. **Database Monitoring**: MongoDB Atlas provides database monitoring.
5. **Alerting**: Alerts for critical errors and performance issues.

## Disaster Recovery

The application includes disaster recovery measures:

1. **Database Backups**: Regular backups of the MongoDB database.
2. **File Backups**: Regular backups of uploaded files.
3. **Deployment Rollbacks**: Ability to roll back to previous deployments.
4. **Multi-Region Deployment**: Deployment across multiple regions for high availability. 